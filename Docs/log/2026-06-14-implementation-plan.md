# 开发实施计划

> 基于 [2026-06-14 设计评审](./2026-06-14-design-review.md) 的决策，制定分阶段实施计划。
> 原则：**自底向上**，先基础设施再业务逻辑，先后端再前端，先核心链路再边缘功能。

---

## 实施路线图总览

```
Phase 0 ─── Schema & 基础设施
   │
Phase 1 ─── 后端核心模块（排课→预约→订单→支付）
   │
Phase 2 ─── 后端辅助模块（账本→报表→营销）
   │
Phase 3 ─── Admin 后台页面
   │
Phase 4 ─── MiniApp 小程序页面
   │
Phase 5 ─── 前后端联调 & 完善
```

---

## Phase 0 — Schema 更新 & 基础设施（1-2天）

### 0.1 更新 Prisma Schema

按设计评审的调整清单修改 `schema.prisma`：

| 修改项 | 说明 |
|--------|------|
| Booking 新增 `PENDING_PAYMENT` 状态枚举值 | 以及 cancelReason、source 字段 |
| Membership 改为 type + 可选字段模型 | COUNT_BASED / DURATION_BASED / HYBRID |
| 删除 Coach 模型 | AdminUser.role 加 COACH，AdminUser 加教练信息字段 |
| Client 补充 phone、avatar、nickname | 微信用户信息 |
| LedgerEntry 加 bookingId | 关联预约以追溯 |
| CouponTemplate 加 maxPerClient | 每人限领次数 |
| 所有模型确认已覆盖 `tenantId` | 租户隔离完整性检查 |

### 0.2 生成迁移 & Seed 框架

```bash
npx prisma migrate dev --name init
npx prisma db seed  # 创建 seed 脚本框架
```

### 0.3 基础设施增强

| 任务 | 说明 |
|------|------|
| 统一错误响应格式 | 全局 `{ code, message, details }` 结构 |
| 租户上下文中间件 | 从 `X-Tenant-Id` header 解析并注入 request |
| 全局异常过滤器 | NestJS `ExceptionFilter` 统一处理 |
| Admin API 客户端 | axios 实例 + 拦截器（token 注入/401 处理） |
| MiniApp API 客户端 | Taro request 封装 |

---

## Phase 1 — 后端核心业务模块（按依赖顺序）

### 1.1 Schedules 排课模块

**依赖**：Services（已实现）、Stores（已实现）

**实现内容**：
- `schedules.controller.ts` — CRUD 端点
- `schedules.service.ts` — 业务逻辑 + 容量乐观锁
- `dto/` — 创建/更新/查询 DTO
- 状态机：OPEN ↔ FULL（bookedCount ≥ maxCapacity）→ CANCELED（软删除）

**关键逻辑**：
- 创建排课时 `bookedCount = 0`
- 查询支持按 `storeId + date` 过滤，按时间段升序
- 软删除时检查：若已有未来预约则自动级联取消（调用 Bookings 的取消接口？后面实现，可以先抛异常禁止删除）

> 实际这里需要先确认删除策略：暂不实现自动级联取消，先禁止删除有预约的排课，等 Booking 模块完成后再补充。

### 1.2 Customers 客户模块

**依赖**：Tenants（已实现）

**实现内容**：
- 客户 CRUD
- 微信用户的 openId 注册/查询
- 手机号绑定接口

### 1.3 Memberships 会员卡模块

**依赖**：Customers（1.2）

**实现内容**：
- 单模型 + type 字段的业务逻辑分发
- 购买会员卡（创建 Order → Payment 流程，1.5 配合实现）
- 扣次接口（供 Booking 模块调用）：`consumeSession(membershipId, count)`
- 查询使用记录
- 退卡（含次数退还逻辑）

### 1.4 Bookings 预约模块（核心）

**依赖**：Schedules（1.1）、Customers（1.2）、Memberships（1.3）

**实现内容**：
- `POST /api/bookings` — **核心端点**，完整事务流程：

```
1. 事务开始
2. 读取 Schedule（行级锁），校验 maxCapacity > bookedCount
3. 判断是否需要付费
   a. 免费 → Booking status = CONFIRMED
   b. 次卡 → 调用 Memberships.consumeSession()，成功则 CONFIRMED
   c. 付费 → Booking status = PENDING_PAYMENT，创建 Order
4. 原子递增 Schedule.bookedCount
5. 事务提交
6. 如需要支付，返回 Order 信息让前端发起支付
```

- `PATCH /bookings/:id/check-in` — 到店核销（CONFIRMED → CHECKED_IN）
- `PATCH /bookings/:id/cancel` — 取消（→ CANCELED）
  - 已扣次卡的需调用 Memberships 退回次数
  - 已支付的需触发退款流程
- `GET /bookings` — 按客户/时段/状态/门店过滤
- 状态转换图：

```
CREATED
  │
  ├──(免费)──────→ CONFIRMED → CHECKED_IN → COMPLETED
  │
  ├──(次卡扣减)──→ CONFIRMED → CHECKED_IN → COMPLETED
  │
  └──(付费)──────→ PENDING_PAYMENT ─(支付回调)─→ CONFIRMED → ...
                      │
                   CANCELED (支付超时/用户取消)

任何状态 → CANCELED（取消时退回次数/触发退款）
```

### 1.5 Orders + Payments 订单与支付模块

**依赖**：Bookings（1.4）

**实现内容**：
- **Orders**：
  - POST 创建订单（由 Booking 模块在需付费时调用，非公开 API）
  - GET 查询订单列表/详情
  - 订单状态：PENDING → PAID → REFUNDED → PARTIAL_REFUND → CLOSED

- **Payments**：
  - 支付网关抽象层：`PaymentGateway` 接口
  - WeChat Pay 实现
  - `POST /payments/unified-order` — 发起支付
  - `POST /payments/notify` — 微信支付回调
  - 回调处理：更新 Order 状态 → 更新 Booking 为 CONFIRMED → 写入 LedgerEntry

---

## Phase 2 — 后端辅助模块

### 2.1 Ledger 账本模块

**依赖**：Payments（1.5）

**实现内容**：
- 仅 GET 查询接口
- 由支付回调自动写入（Phase 1.5 中实现）
- 按时间/门店/类型过滤
- 支持导出

### 2.2 Reports 报表模块

**实现内容**：
- 仪表盘数据聚合（今日预约数/核销数/收入/活跃会员）
- 按门店/教练/时间维度的统计
- 后端提供聚合数据，前端负责展示

### 2.3 Marketing 营销模块

**实现内容**：
- 优惠券模板 CRUD
- 领券/核销逻辑
- 有效期管理

---

## Phase 3 — Admin 前端页面

按依赖后端接口的优先级排序：

### 3.1 登录页 + 路由守卫（独立，可先做）

- LoginPage：用户名密码表单 → 调用 auth/admin-login → 存 JWT
- AuthGuard：检查 token，无则重定向到 /login
- 404 页面

### 3.2 Data Dashboard（连接真实数据）

- 替换现有 mock 数据，接入 Reports API
- 今日概览卡片（预约数、核销数、收入、活跃会员）
- 最近预约列表

### 3.3 Staff 员工管理页

- 员工/教练统一管理列表
- 角色筛选（OWNER / ADMIN / STAFF / COACH）
- 教练额外信息编辑（bio、头像、擅长领域）

### 3.4 Services 课程管理页

- 课程 CRUD 表单
- 分类管理（Group / Private）
- 价格/时长/容量设置

### 3.5 Schedules 排课管理页

- 日历视图（按周/月切换）
- 创建排课弹窗（选择课程、教练、时间、容量）
- 排课列表展示（容量使用进度条）
- 取消排课操作

### 3.6 Bookings 预约管理页

- 预约列表（按状态/日期/教练过滤）
- 核销操作按钮
- 取消操作（含原因弹窗）

### 3.7 Memberships 会员卡管理页

- 会员卡列表（按客户、类型过滤）
- 购买记录
- 手动调整次数

### 3.8 Finance 财务管理页

- 订单列表
- 账本流水查询

### 3.9 Marketing / Reports / Settings

- 优惠券模板管理
- 报表查看
- 门店信息设置

---

## Phase 4 — MiniApp 小程序页面

### 4.1 微信登录 + 手机号绑定

- 调用 `wx.login()` 获取 code → 后端 `/auth/weapp-login`
- 绑定手机号弹窗（`<button open-type="getPhoneNumber">`）
- 登录后缓存 token

### 4.2 首页改造（门店选择器）

- 顶部门店下拉选择器
- 选中后缓存到本地存储
- 后续所有页面按选中门店展示

### 4.3 课程详情页（新增）

- 课程信息（名称、教练头像/简介、价格、时长、描述）
- 可选时段列表（来自 Schedules API，实时显示剩余名额）
- "立即预约"按钮

### 4.4 确认预约页（新增）

- 确认信息（课程、时段、价格）
- 如有可用会员卡：显示会员卡选择（用卡免费 or 直接付费）
- 无会员卡：显示价格和"去支付"按钮
- 提交预约

### 4.5 我的预约页（替代占位页）

- 预约列表（按状态分组：进行中/已完成/已取消）
- 每种预约可操作（取消、查看详情）
- 核销后显示完成状态

### 4.6 个人中心页（替代占位页）

- 用户头像、昵称、手机号
- 我的会员卡（卡片列表，显示剩余次数/有效期）
- 设置入口

---

## Phase 5 — 联调 & 完善

### 5.1 前后端联调

- Admin 所有页面从 mock 切换到真实 API
- MiniApp 所有页面从 mock 切换到真实 API
- 全流程验证：登录 → 排课 → 预约 → 支付 → 核销 → 完成

### 5.2 数据完善

- Seed 脚本：demo 租户、门店、员工、课程、排课、客户、会员卡
- 开发环境自动填充测试数据

### 5.3 测试

- 后端单元测试（Service 层）
- Booking 创建的事务测试（并发场景）
- 前端组件测试

### 5.4 文档同步

- 更新 API_CATALOG.md
- 更新 ARCHITECTURE.md
- 更新 DATABASE_MODEL.md

---

## 依赖关系图

```
Phase 0 ─────────────────────────────────────────────────────────────┐
   │                                                                  │
   ▼                                                                  │
Phase 1.1 Schedules   Phase 1.2 Customers                            │
   │                      │                                           │
   └──────────┬───────────┘                                           │
              │                                                       │
         Phase 1.3 Memberships                                        │
              │                                                       │
              ▼                                                       │
         Phase 1.4 Bookings (核心) ─── 依赖 1.1/1.2/1.3              │
              │                                                       │
              ▼                                                       │
         Phase 1.5 Orders + Payments                                  │
              │                                                       │
              ▼                                                       │
         Phase 2.1 Ledger      Phase 2.2 Reports   Phase 2.3 Marketing│
                                                         │            │
                                                         │            │
Phase 3 Admin ───────────────── Phase 4 MiniApp ────────┘────────────┘
   │                                │
   └──────────┬─────────────────────┘
              ▼
         Phase 5 联调 & 完善
```

---

## 建议开发顺序（按迭代）

### Iteration 1：跑通核心链路

```
Phase 0 (Schema + 基础设施)
  → Phase 1.1 (Schedules)
  → Phase 1.2 (Customers)
  → Phase 1.3 (Memberships)
  → Phase 1.4 (Bookings)
  → Phase 1.5 (Orders + Payments)
```

完成后可用 Postman/curl 跑通完整业务流程。

### Iteration 2：Admin 后台

```
Phase 3.1 (登录)
  → Phase 3.2 (Dashboard)
  → Phase 3.5 (Schedules 页面, 配合 1.1)
  → Phase 3.6 (Bookings 页面, 配合 1.4)
  → Phase 3.7 (Memberships 页面, 配合 1.3)
  → Phase 3.3/3.4/3.8 (剩余页面)
```

### Iteration 3：MiniApp 小程序

```
Phase 4.1 (登录)
  → Phase 4.2 (首页改造)
  → Phase 4.3 (课程详情)
  → Phase 4.4 (确认预约)
  → Phase 4.5 (我的预约)
  → Phase 4.6 (个人中心)
```

### Iteration 4：收尾

```
Phase 2 (辅助模块)
  → Phase 5 (联调 + 测试 + seed)
```
