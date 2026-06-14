# LuminaStudio

面向中小型普拉提和瑜伽工作室的多租户运营 SaaS 平台。支持门店管理、课程排课、预约管理、支付处理、到店核销、会员卡追踪和数据报表。

---

[English](./README.md) | **中文**

---

## 技术栈

| 层 | 技术 |
|---|------|
| 后端 | NestJS 11, TypeScript, Prisma 6, MySQL |
| 管理后台 | React 18, Vite 6, Ant Design 5, TypeScript |
| 小程序 | Taro 4, React 18, Zustand, TypeScript |
| 认证 | JWT + Passport, 微信登录 |
| 仓库 | npm workspaces 单仓 |

## 项目结构

```
LuminaStudio/
├── apps/
│   ├── server/     # NestJS REST API (端口 3000)
│   ├── admin/      # React 管理后台 (端口 5173)
│   └── miniapp/    # 微信小程序
├── Docs/
│   ├── PRD.md              # 产品需求文档
│   ├── ARCHITECTURE.md     # 系统架构设计
│   ├── DATABASE_MODEL.md   # 数据库模型
│   ├── API_CATALOG.md      # API 接口目录
│   ├── FRONTEND_DESIGN_SYSTEM.md  # 前端设计系统
│   ├── DEV_LOG.md          # 开发进度与决策记录
│   └── log/                # 详细设计与实施日志
├── package.json
└── tsconfig.base.json
```

## 环境要求

- Node.js >= 18.18.0
- MySQL 8.0+（可用 Docker 本地运行）
- 微信开发者账号（小程序用）

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp apps/server/.env.example apps/server/.env
# 编辑 apps/server/.env，填入数据库连接和 JWT 密钥

# 3. 启动 MySQL（Docker）
docker run -d --name luminastudio-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=luminastudio \
  -p 3306:3306 mysql:8.0

# 4. 生成 Prisma 客户端并执行迁移
cd apps/server
npm run prisma:generate
npm run prisma:migrate    # 创建数据库表
cd ../..

# 5. 启动开发服务器（分别开终端）
npm run dev:server   # API → http://localhost:3000/api
npm run dev:admin    # 后台 → http://localhost:5173

# 6. （可选）启动小程序
npm run dev:miniapp  # Taro 微信小程序
```

## 可用脚本

| 命令 | 位置 | 说明 |
|------|------|------|
| `npm run dev:server` | 根目录 | 启动后端服务（端口 3000） |
| `npm run dev:admin` | 根目录 | 启动管理后台（端口 5173） |
| `npm run dev:miniapp` | 根目录 | 启动小程序开发构建 |
| `npm run build` | 根目录 | 构建所有应用 |
| `npm run prisma:generate` | `apps/server` | 从 Schema 生成 Prisma 客户端 |
| `npm run prisma:migrate` | `apps/server` | 执行数据库迁移 |
| `npm run prisma:studio` | `apps/server` | 打开 Prisma Studio（数据库浏览器） |

## 开发登录

执行 Seed 后默认账号：

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | `admin` | `admin123` |

所有 API 请求需传递 `X-Tenant-Id: 1` 请求头。

## 后端模块（共 15 个）

| 模块 | 端点 | 状态 |
|------|------|------|
| Auth | `/api/auth/*` | ✅ JWT + 管理员/微信登录 |
| Tenants | `/api/tenants` | ✅ 租户 CRUD |
| Stores | `/api/stores` | ✅ 门店 CRUD |
| Staff | `/api/admin-users` | ✅ 员工+教练管理 |
| Services | `/api/services` | ✅ 课程服务 CRUD |
| Customers | `/api/customers` | ✅ 客户管理 |
| Schedules | `/api/schedules` | ✅ 排课 + 容量管理 |
| Bookings | `/api/bookings` | ✅ 核心模块（三种支付路径 + 核销/取消） |
| Memberships | `/api/memberships` | ✅ 多类型会员卡 |
| Orders | `/api/orders` | ✅ 订单管理（仅付费场景） |
| Payments | `/api/payments` | ✅ 支付发起 + 回调处理 |
| Ledger | `/api/ledger` | ✅ 只读账本查询 |
| Reports | `/api/reports` | ✅ 聚合统计 |
| Marketing | `/api/marketing` | ✅ 优惠券管理 |
| Common | `/api/health` | ✅ 基础设施 |

## 管理后台页面（11 页）

| 页面 | 路由 | 说明 |
|------|------|------|
| 登录 | `/login` | JWT 认证 |
| 仪表盘 | `/dashboard` | 实时数据 + 最近预约 |
| 门店管理 | `/stores` | 门店信息管理 |
| 员工管理 | `/staff` | 员工与教练管理 |
| 课程服务 | `/classes` | 课程/服务 CRUD |
| 排课管理 | `/schedules` | 排课管理 |
| 预约管理 | `/bookings` | 预约全生命周期（核销/取消） |
| 会员卡 | `/memberships` | 会员卡发放与管理 |
| 财务管理 | `/finance` | 订单 + 账本流水 |
| 报表 | `/reports` | KPI 数据总览 |
| 营销 | `/marketing` | 优惠券模板管理 |

## 小程序页面（6 页）

| 页面 | 说明 |
|------|------|
| 首页 | 门店选择器 + 即将开始的课程 |
| 课程列表 | 课程列表（类型筛选） |
| 课程详情 | 课程信息、教练、时段 |
| 确认预约 | 预约摘要 + 会员卡选择 + 提交 |
| 我的预约 | Upcoming/History 分组 + 取消操作 |
| 个人中心 | 用户信息 + 会员卡列表 |

## 文档

- [开发日志](Docs/DEV_LOG.md) — 进度追踪与设计决策
- [PRD 产品需求](Docs/PRD.md)
- [系统架构](Docs/ARCHITECTURE.md)
- [数据库模型](Docs/DATABASE_MODEL.md)
- [API 接口目录](Docs/API_CATALOG.md)
- [前端设计系统](Docs/FRONTEND_DESIGN_SYSTEM.md)

## 许可证

MIT
