# LuminaStudio Development Log

> 记录开发进度、待办事项和决策，方便隔段时间回来知道开发到哪里了。
>
> 📖 完整设计决策记录 → [log/INDEX.md](./log/INDEX.md)

---

## 项目状态总览

| 领域 | 状态 | 完成度 |
|------|------|--------|
| Prisma Schema | ✅ 已完成 | 14 个模型 |
| 后端模块 | ✅ 全部完成 | 15/15 模块均已实现 |
| 管理后台页面 | ✅ 全部完成 | 11/11 页面均已实现 |
| 小程序页面 | 🟡 核心完成 | 7 页 + API 对接；UI/交互持续优化 |
| 前后端联调 | 🟡 进行中 | 需 MySQL + `db:setup` 后整体验证 |
| 微信生产对接 | ❌ 未开始 | 登录/支付为 dev mock |
| 协作文档 | ✅ 已建立 | `Docs/通用.md` + 各端 `.md` |

> 📋 跨角色协作文档见 [通用.md](./通用.md)、[小程序.md](./小程序.md)、[后端.md](./后端.md)、[后台管理.md](./后台管理.md)

---

## 开发日志

### 2026-08-18 — 上线前加固

- 🔒 **支付回调**：dev notify 需登录且幂等；重复通知不再重复发卡
- 💳 **取消预约**：储值卡退余额、次卡退次数；时长卡不误加次数
- 👤 **越权**：客户只能查看/取消自己的预约与会员卡
- 🛡️ **JWT**：生产环境禁止使用默认密钥
- 📱 **小程序**：首页为入口、未登录可逛、满课禁约、头像与错误态
- 🖥️ **Admin**：角色菜单、预约筛选、排课下拉、营销编辑有效期

### 2026-06-20 — 课程表/会员卡/联调

- ✅ **Seed 联调**：10 条排课（含今日）、3 种会员卡模板、demo 用户会员卡
- ✅ **E2E**：`npm run e2e` 全链路通过（登录→预约→支付→核销）
- 📅 **课程页**：课程表视图 + 周日历条 + 日期选择器 + 列表视图
- 💳 **会员卡种类**：`MembershipTemplate` 模型 + Admin「会员卡种类」页
- 📱 **小程序**：手机号绑定（`POST /auth/bind-phone-code`）+ 会员卡视觉卡片
- 🔧 **Dev 登录**：统一 `dev_openid_demo`，与 seed 演示数据对齐

### 2026-06-20 — 协作文档 + 小程序 UI 优化

- 📄 **跨端协作文档**：新增 `通用.md`、`小程序.md`、`后端.md`、`后台管理.md`
- 🎨 **小程序 UI**：首页 Hero 卡片、快捷入口、课程/预约空状态与加载态
- 🏪 **全局门店**：Zustand store 持久化，课程页同步 `storeId` 筛选
- 🧩 **共享组件**：`EmptyState`、`LoadingState` + `styles/tokens.scss`

### 2026-06-14 — Iteration 4 剩余模块收尾

- 📒 **Ledger 后端**：只读账本查询（append-only），按时间/类型/门店过滤 + 汇总
- 📊 **Reports 后端**：Dashboard 聚合数据、收入报表、预约统计
- 🎟️ **Marketing 后端**：优惠券模板 CRUD + 发券/领券
- 💰 **Admin Finance**：订单列表 + 账本流水（Tabs 切换）
- 📈 **Admin Reports**：6 项关键指标总览卡片
- 🏷️ **Admin Marketing**：优惠券模板管理（CRUD + 有效期）

### 2026-06-14 — Iteration 3 MiniApp 小程序页面完成

- 🏠 **首页**：门店选择器 + 对接 API 展示即将开始的课程
- 📋 **课程列表**：对接 API + 类型筛选（All/Group/Private）
- 📖 **课程详情页**（新增）：课程信息、教练信息、时段选择
- ✅ **确认预约页**（新增）：预约摘要、会员卡选择、提交预约
- 📅 **我的预约**：按 Upcoming/History 分组、取消操作
- 👤 **个人中心**：用户信息、会员卡列表、微信登录入口
- 🔗 全部对接后端 API（配置在 `services/api.ts`）

### 2026-06-14 — Iteration 2 Admin 后台页面完成

- 🔐 **登录页**：LoginPage + AuthGuard 路由守卫 + JWT 管理
- 📊 **Dashboard**：对接真实 API 数据（今日预约/核销/收入/活跃客户）
- 👥 **Staff 页面**：员工+教练管理，含角色/职称/手机号
- 📋 **Services 页面**：课程服务 CRUD
- 📅 **Schedules 页面**：排课管理，含时间选择器
- 📑 **Bookings 页面**：预约列表 + 状态过滤 + 核销/取消操作
- 💳 **Memberships 页面**：会员卡发放/查看/取消
- 🔄 AdminShell 增加用户信息和登出功能

### 2026-06-14 — Iteration 1 核心后端链路完成

- 📐 **设计评审**：完成 10 项核心设计决策（详见 `log/2026-06-14-design-review.md`）
- 🗃️ **Schema 重构**：Coach 合并到 AdminUser，Booking 加 PENDING_PAYMENT/source，Membership type 枚举化，Order 加 bookingId
- 🏗️ **基础设施**：全局异常过滤器，TenantId 装饰器，Admin/MiniApp API 客户端
- 📅 **Schedules 模块**：CRUD + 容量乐观锁 + 软删除
- 👤 **Customers 模块**：CRUD + 微信用户信息 + 手机号绑定
- 💳 **Memberships 模块**：多类型支持（次数/时长/混合），扣次/退卡，使用记录查询
- 📋 **Bookings 模块（核心）**：事务内容量校验 + 三种支付路径（免费/扣卡/付费）+ 核销/取消/状态机
- 📦 **Orders 模块**：订单 CRUD（仅付费场景创建）
- 💰 **Payments 模块**：支付发起 + 回调通知处理 + 自动写入账本

### 2024-06-14

- 初始化 git 仓库，配置 `.gitignore`
- 更新 README.md
- 后端基础框架搭建完成（NestJS + Prisma）
- 管理后台脚手架（React + Vite + Ant Design）
- 小程序脚手架（Taro + React + Zustand）

---

## 后端模块完成状态

### ✅ 已实现（有完整代码）

| 模块 | 端点 | 说明 |
|------|------|------|
| Auth | POST /auth/admin-login, POST /auth/weapp-login, GET /auth/me | JWT 认证，mock 微信登录 |
| Tenants | CRUD /tenants | 租户管理 |
| Stores | CRUD /stores | 门店管理 |
| Staff | CRUD /admin-users | 员工/教练管理（role=COACH） |
| Services | CRUD /services | 课程/服务管理 |
| Customers | CRUD /customers | 客户管理（含微信信息） |
| Schedules | CRUD /schedules | 排课管理（容量乐观锁，按门店/日期过滤） |
| Bookings | POST+GET+PATCH /bookings | 预约核心（事务容量校验、三种支付路径、状态机） |
| Memberships | CRUD /memberships | 多类型会员卡（次数/时长/混合，扣次/退卡） |
| Orders | CRUD /orders | 订单管理（仅付费场景） |
| Payments | POST+Notify /payments | 支付发起 + 回调处理 + 自动入账 |
| Common | GET /health, DTOs, Guards, Filters | 基础设施 + 全局异常过滤器 + API 客户端 |

---

## 前端页面完成状态

### ✅ 已实现

- **Admin 11 页**：Login、Dashboard、Stores、Staff、Services、Schedules、Bookings、Memberships、Finance、Reports、Marketing
- **MiniApp 6 页**：Home（门店选择器）、Classes（类型筛选）、ClassDetail、BookingConfirm、Bookings（分组+取消）、Profile（会员卡）

### 📋 剩余待办

- [ ] 数据库迁移 apply（需 MySQL 就绪后 `prisma migrate deploy`）
- [ ] 微信登录真实对接（目前后端是 mock，`weapp-login` 的 TODO）
- [ ] 前后端联调收尾（前端已对接 API，需要整体跑通）
- [ ] Seed 数据脚本（`prisma/seed.ts`，生成 demo 租户/门店/课程/排课）
- [ ] 测试（后端单元测试 + 并发预约场景测试）

---

## 待办事项

- [ ] 数据库迁移 apply（`prisma migrate deploy`，需 MySQL）
- [ ] 微信登录真实对接（`auth.service.ts` 中 weapp-login 的 TODO）
- [ ] 前后端联调收尾（需要数据库就绪后整体跑通）
- [ ] Seed 数据脚本（`prisma/seed.ts`，demo 租户/门店/课程/排课）
- [ ] 测试（后端单元测试 + 并发预约场景测试）

---

## 已知问题（当前有效）

1. **微信生产**：AppID/Secret 与支付 v3 未配置，登录/支付仍为 dev mock
2. **优惠券核销**：小程序可查看券，预约/购卡尚未抵扣
3. **Prisma migrate**：生产应 `migrate deploy`；当前 schema 比历史 migration 新，需补迁移
4. **付费预约取消**：未自动发起微信退款（需生产支付通道）

---

## 设计分析（历史快照 · 2024-06-14）

> ⚠️ 以下内容描述的是**早期脚手架阶段**的问题，不代表当前代码状态。当前实现见上方状态总览。

### 1. 后端空壳模块过多

6/15 模块有实际代码，9/15 只有空 `@Module({})`。核心业务流（预约→订单→支付）完全没接上。

**影响**：无法跑通一个完整的业务流程。

### 2. Schedule 容量存在并发问题

`schedules` 表使用 `bookedCount` 字段记录已预约数，多用户同时预约时会出现超卖。

**建议**：使用 Prisma 事务 + 乐观锁（版本号字段），或在数据库层用原子更新 `UPDATE ... SET bookedCount = bookedCount + 1 WHERE bookedCount < capacity`。

### 3. 预约状态机缺少"待支付"状态

```
当前设计: CREATED → CONFIRMED → CHECKED_IN → COMPLETED → CANCELED
```

PRD 第 8 章提到"支付成功是 attendance 的前提"，但状态机没有体现需要支付才能确认。对于付费课程，应该区分"已创建（未支付）"和"已确认（已支付）"。

**建议**：将 `CREATED` 拆分为 `PENDING_PAYMENT` → `CONFIRMED`，或增加一个业务规则：需要支付的课程在支付前不能进入 `CONFIRMED`。

### 4. 前端无认证页面

后端有完整的 JWT 认证逻辑，但管理后台没有 Login 页面，小程序也没有微信登录流程。现在所有请求都没有 token。

### 5. 全部使用 Mock 数据

管理后台和小程序的所有页面数据都是硬编码的 mock，没有调用任何 API。随着后端模块逐步实现，需要同步接入真实接口。

### 6. 支付网关未抽象

`payments.module` 直接叫 `wechat/unified-order`，没有支付网关抽象层。PRD 也提到需要决定是否抽象。

**建议**：定义 `PaymentGateway` 接口，微信作为第一个实现，后续扩展其他支付通道不需要改业务代码。

### 7. 缺少标准错误响应格式

API 设计规则提到"stable error codes"，但代码中没有统一的错误响应结构。建议全局定义：

```json
{
  "code": "ERROR_CODE",
  "message": "人类可读的消息",
  "details": {}
}
```

### 8. Schedule 状态不清晰

`ARCHIVED` 状态何时进入？`CANCELED` 和 `ARCHIVED` 的区别是什么？`FULL → 何时变回 OPEN`（有人取消后）没有定义。

### 9. 缺少 Seed 数据

没有 seed 脚本，开发和测试需要手动构造数据。建议用 Prisma 的 seed 功能创建一套 demo 数据。

### 10. 设计文档和代码部分脱节

API 目录中 `/api/finance/*` 有 POST/PATCH/DELETE 操作，但从记账角度，财务流水应该是只追加的（append-only），不应该允许修改或删除。
