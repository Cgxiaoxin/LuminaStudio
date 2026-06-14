# 设计评审与优化决策

> 日期：2026-06-14
> 背景：首次全面设计评审，在正式进入核心业务开发前，梳理当前设计问题并做出关键决策。
> 参与：独立设计评审

---

## 一、评审背景

项目处于早期开发阶段（v0.1.0），已完成脚手架搭建和基础模块。即将进入核心业务链路开发（排课→预约→订单→支付），需要在开发前统一设计口径。

### 当前完成情况

| 区域 | 完成度 |
|------|--------|
| 后端 Auth / Tenants / Stores / Staff / Services | ✅ 5 个模块完整 |
| 后端剩余 9 个模块（Customers~Marketing） | ❌ 空壳 |
| Admin Dashboard / Stores 页面 | ✅ 有 UI（mock 数据） |
| Admin 剩余 9 个页面 | ❌ 占位符 |
| MiniApp Home / Classes 页面 | ✅ 有 UI（mock 数据） |
| MiniApp Bookings / Profile 页面 | ❌ 占位符 |
| 前后端联调 | ❌ 未开始 |
| 数据库迁移 | ❌ 未生成 |

---

## 二、发现的设计问题

### 问题 1：预约状态机缺少支付等待态

**现状**：`CREATED → CONFIRMED → CHECKED_IN → COMPLETED → CANCELED`

**问题**：付费课程或需要扣次卡的课程，预约不能直接 CONFIRMED。缺少支付环节的等待状态。

**决策**：在 CREATED 和 CONFIRMED 之间插入 `PENDING_PAYMENT` 状态。预约创建时的路由逻辑：

```
                  ┌─────────────┐
                  │  CREATED     │
                  └──────┬──────┘
                         │
                  ┌──────▼──────┐
                  │  需要付费？  │
                  └──┬──────┬──┘
                     │      │
                ┌────▼──┐ ┌─▼───────┐
                │PP(付)  │ │CONFIRMED│
                └───┬───┘ │(免费/卡)│
                    │     └─────────┘
              支付成功│
                    │
              ┌─────▼─────┐
              │ CONFIRMED  │
              └─────┬─────┘
                    │
              ┌─────▼─────┐
              │ CHECKED_IN │→ COMPLETED
              └───────────┘

CANCELED ← 任何状态均可取消
```

---

### 问题 2：Schedule 容量并发超卖

**现状**：`Schedule.bookedCount` 字段，无并发保护。

**问题**：两人同时预约最后一个名额，双双通过校验，导致超卖。

**决策**：使用 Prisma 事务 + 原子更新（`UPDATE bookedCount = bookedCount + 1 WHERE bookedCount < maxCapacity`）。不引入 Redis 等外部依赖。

---

### 问题 3：Order 与 Booking 关系不清晰

**现状**：`Order.bookingId` optional，但次卡场景是否需要 Order 不明确。

**问题**：非付费场景（免费课、次卡扣减）不应产生 Order。当前设计路径混乱。

**决策**：**预约和支付解耦**。Booking 独立存在，完整的自身状态机。Order 仅在「需要付费」时创建。次卡扣减直接操作 Membership，不经过 Order。Payment 挂 Order 下。

---

### 问题 4：会员卡仅支持次数卡

**现状**：`Membership { totalSessions, remainingSessions }`

**问题**：不支持时长卡（30 天无限练）和混合型（30 天 20 次）。

**决策**：单模型 + type 字段：

```prisma
enum MembershipType {
  COUNT_BASED      // 次数卡
  DURATION_BASED   // 时长卡
  HYBRID           // 混合型
}

model Membership {
  type               MembershipType
  totalSessions      Int?        // 次数卡/混合型
  remainingSessions  Int?        // 次数卡/混合型
  startDate          DateTime?   // 时长卡/混合型
  endDate            DateTime?   // 时长卡/混合型
  // ... 共用字段
}
```

---

### 问题 5：教练(Coach)与员工(AdminUser)分离

**现状**：独立 Coach 模型，与 AdminUser 无关联。

**问题**：小工作室教练往往也是员工（老板兼教练），重复管理不方便。

**决策**：**合并**。删除独立 Coach 模型，AdminUser 扩展 role 枚举：

```diff
- enum AdminRole { OWNER ADMIN STAFF }
+ enum AdminRole { OWNER ADMIN STAFF COACH }
```

AdminUser 增加教练信息字段（bio、avatar、expertise 等），role=COACH 即视为教练。

---

### 问题 6：小程序无多门店选择逻辑

**问题**：当前首页直接展示课程，未考虑多门店情况。课程按门店隔离。

**决策**：首页顶部加门店选择器（类似美团/大众点评），选择后内容按门店过滤。选择记录存本地缓存。

---

### 问题 7：租户(Tenant)解析策略未定

**现状**：AuthController 有 `// TODO: Resolve tenantId from context or header`

**决策**：请求头方式。Admin 前端在请求头 `X-Tenant-Id` 传递。小程序通过登录时绑定的上下文自动携带。

---

### 问题 8：删除/取消的级联规则未定义

**问题**：取消排课、删除服务时，关联预约如何处理无定义。

**决策**：软删除 + 状态联动。

- 排课取消 → 未来预约自动 CANCELED（记录取消原因），已完成预约保留
- 服务删除(禁用) → 未来排课全部 CANCELED，已有排课保留但不可新增
- 所有操作记录 AuditLog

---

### 问题 9：账本允许修改/删除

**现状**：API_CATALOG 中 `finance/ledger` 允许 POST/PATCH/DELETE。

**问题**：账本条目必须只追加（append-only），会计合规红线。

**决策**：账本只记录付款到账。LedgerEntry 由支付成功回调自动写入，不开放手动创建接口。API 仅保留 GET 查询。不允许 PATCH/DELETE。

---

### 问题 10：前后端均无登录页

**问题**：后端 JWT 完整，但 Admin 无登录页，小程序无微信登录流程。

**决策**：

- Admin：独立登录页 → JWT 存 localStorage → 路由守卫验证 → axios 拦截器自动带 token，401 跳转登录
- MiniApp：微信静默登录 → 手机号绑定弹窗 → 获取 openId → 后端签发 JWT

---

## 三、优化后整体架构

### 3.1 模块边界

```
apps/server/src/modules/
├── auth/             认证（不变）
├── tenants/          租户（不变）
├── stores/           门店（不变）
├── admin-users/      员工管理（原 staff，合并 coach）
├── services/         课程服务（不变）
├── schedules/        排课（容量乐观锁）
├── bookings/         预约（扩展状态机）
├── memberships/      会员卡（单模型+type）
├── orders/           订单（仅付费场景）
├── payments/         支付（不变）
├── ledger/           账本（仅追加）
├── customers/        客户管理
├── reports/          报表
├── marketing/        优惠券
└── common/           通用（不变）
```

### 3.2 核心交互流程

```
① 排课(Schedule) →  ② 预约(Booking)
                        │
               ┌────────┴────────┐
               │ 是否需要付费？    │
               └──┬──────────┬───┘
                  │          │
            需要付费     不需要付费
                  │          │
          创建 Order    ┌─────┴──────┐
               │       │ 有会员卡?   │
          Payment      │ 次数够?     │
               │       └──┬──────┬──┘
          支付成功     有会员卡  无会员卡
               │          │       │
               │    扣减次数  直接确认
               │    确认预约  预约
               │          │
               └────┬─────┘
                    │
              ┌─────▼─────┐
              │ CONFIRMED  │
              └─────┬─────┘
                    │
              ┌─────▼─────┐
              │ CHECKED_IN │ → 到店核销
              └─────┬─────┘
                    │
              ┌─────▼─────┐
              │ COMPLETED  │
              └───────────┘
```

### 3.3 后端 API 规划

| 模块 | 方法 | 路径 | 说明 |
|------|------|------|------|
| Auth | POST | /api/auth/admin-login | 管理员登录 |
| Auth | POST | /api/auth/weapp-login | 微信小程序登录 |
| Auth | GET | /api/auth/me | 当前用户信息 |
| Tenants | CRUD | /api/tenants | 租户管理 |
| Stores | CRUD | /api/stores | 门店管理 |
| AdminUsers | CRUD | /api/admin-users | 员工管理（含教练） |
| Services | CRUD | /api/services | 课程服务 |
| Schedules | CRUD | /api/schedules | 排课管理 |
| Bookings | POST | /api/bookings | 创建预约（事务内校验容量） |
| Bookings | GET | /api/bookings | 预约列表 |
| Bookings | GET | /api/bookings/:id | 预约详情 |
| Bookings | PATCH | /api/bookings/:id/check-in | 核销 |
| Bookings | PATCH | /api/bookings/:id/cancel | 取消 |
| Memberships | POST | /api/memberships | 购买会员卡 |
| Memberships | GET | /api/memberships | 会员卡列表 |
| Memberships | GET | /api/memberships/:id/usage | 使用记录 |
| Memberships | PATCH | /api/memberships/:id/cancel | 退卡 |
| Orders | CRUD | /api/orders | 订单（仅付费） |
| Payments | POST | /api/payments/unified-order | 发起支付 |
| Payments | POST | /api/payments/notify | 微信回调 |
| Ledger | GET | /api/ledger | 账本查询（只读） |
| Customers | CRUD | /api/customers | 客户管理 |
| Reports | GET | /api/reports/* | 报表 |
| Marketing | CRUD | /api/coupon-templates | 优惠券模板 |

### 3.4 前端页面规划

**Admin 后台（13 页）：**

| 页面 | 路径 | 状态 |
|------|------|------|
| 登录页 | /login | 新增 |
| 仪表盘 | /dashboard | 已有（需对接数据） |
| 门店管理 | /stores | 已有（需对接 API） |
| 员工管理 | /staff | 待实现 |
| 课程服务 | /services | 待实现 |
| 排课管理 | /schedules | 待实现 |
| 预约管理 | /bookings | 待实现 |
| 会员卡 | /memberships | 待实现 |
| 财务管理 | /finance | 待实现 |
| 报表 | /reports | 待实现 |
| 营销 | /marketing | 待实现 |
| 设置 | /settings | 待实现 |

**MiniApp（6 页）：**

| 页面 | 路径 | 状态 |
|------|------|------|
| 首页 | /pages/home/index | 已有（加门店选择器） |
| 课程列表 | /pages/classes/index | 已有（需对接数据） |
| 课程详情 | /pages/class-detail/index | 新增 |
| 确认预约 | /pages/booking-confirm/index | 新增 |
| 我的预约 | /pages/bookings/index | 待实现 |
| 个人中心 | /pages/profile/index | 待实现 |

---

## 四、本次决策清单

| # | 决策事项 | 选择方案 | 影响范围 |
|---|---------|---------|---------|
| 1 | 预约支付模型 | Booking 与支付解耦，Order 仅付费场景 | Bookings / Orders / Memberships 模块 |
| 2 | 会员卡计费模型 | 单模型 + type 字段 | Memberships 模块 + 前端 |
| 3 | 教练与员工关系 | 合并到 AdminUser，role=COACH | Staff 模块、Prisma Schema、前端 |
| 4 | 小程序门店选择 | 首页顶部选择器 | MiniApp Home、全局状态 |
| 5 | 租户解析策略 | 请求头 X-Tenant-Id | 所有 API 请求 |
| 6 | 级联规则 | 软删除 + 状态联动 | Schedules / Bookings / Services |
| 7 | 账本设计 | 只追加，支付回调自动写入 | Ledger 模块 |
| 8 | Admin 登录 | 独立登录页 + JWT | Admin 前端 |
| 9 | 防超卖 | Prisma 事务 + 原子更新 | Schedules / Bookings 模块 |
| 10 | 预约流程 | 列表→详情→确认→支付 | MiniApp 页面结构 |

---

## 五、待办事项（按优先级）

### P0 — 核心业务链路（开发前必须确定）

- [ ] 更新 Prisma Schema（按上述调整清单：Booking 加 PENDING_PAYMENT、Membership 加 type、移除 Coach、Client 补字段、LedgerEntry 加 bookingId）
- [ ] 更新 API_CATALOG.md（反映新的 API 设计）
- [ ] 更新 ARCHITECTURE.md（反映模块边界调整）
- [ ] 生成 Prisma 迁移文件

### P1 — 实现核心流程

- [ ] Schedules 模块（CRUD + 容量管理）
- [ ] Bookings 模块（扩展状态机 + 事务校验）
- [ ] Memberships 模块（多类型支持）
- [ ] Orders 模块（仅付费场景）
- [ ] Payments 模块（微信支付）
- [ ] Admin: 登录页 + 路由守卫
- [ ] MiniApp: 微信登录 + 手机号绑定

### P2 — 管理后台页面

- [ ] Staff（含教练管理）
- [ ] Services
- [ ] Schedules（日历视图）
- [ ] Bookings（含核销操作）
- [ ] Memberships
- [ ] Finance（Order + Ledger）

### P3 — 完善

- [ ] Ledger 模块
- [ ] Reports 模块
- [ ] Marketing 模块
- [ ] MiniApp 详情/确认/支付页
- [ ] 前后端联调
- [ ] Seed 数据
- [ ] 测试
