# LuminaStudio

**English** | [中文](./README.zh.md)

Multi-tenant operations SaaS for small and mid-sized Pilates and yoga studios. Supports studio activation, class scheduling, booking management, payment processing, check-ins, membership tracking, and reporting.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11, TypeScript, Prisma 6, MySQL |
| Admin Web | React 18, Vite 6, Ant Design 5, TypeScript |
| Mini Program | Taro 4, React 18, Zustand, TypeScript |
| Auth | JWT + Passport, WeChat login |
| Monorepo | npm workspaces |

## Architecture

```
LuminaStudio/
├── apps/
│   ├── server/     # NestJS REST API (port 3000)
│   ├── admin/      # React admin console (port 5173)
│   └── miniapp/    # WeChat mini program
├── Docs/
│   ├── PRD.md           # Product requirements
│   ├── ARCHITECTURE.md  # System design
│   ├── DATABASE_MODEL.md
│   ├── API_CATALOG.md
│   ├── FRONTEND_DESIGN_SYSTEM.md
│   ├── DEV_LOG.md       # Development progress & decisions
│   └── log/             # Detailed design & implementation logs
├── package.json
└── tsconfig.base.json
```

## Prerequisites

- Node.js >= 18.18.0
- MySQL 8.0+ (or Docker for local development)
- WeChat developer account (for mini program)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp apps/server/.env.example apps/server/.env
# Edit apps/server/.env with your database URL, JWT secret

# 3. Start MySQL (Docker)
docker run -d --name luminastudio-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=luminastudio \
  -p 3306:3306 mysql:8.0

# 4. Generate Prisma client & apply migrations
cd apps/server
npm run prisma:generate
npm run prisma:migrate    # Creates tables
cd ../..

# 5. Start dev servers (in separate terminals)
npm run dev:server   # API at http://localhost:3000/api
npm run dev:admin    # Admin at http://localhost:5173

# 6. (Optional) Start mini program
npm run dev:miniapp  # WeChat mini program via Taro
```

## Available Scripts

| Script | Location | Description |
|--------|----------|-------------|
| `npm run dev:server` | root | Start NestJS dev server (port 3000) |
| `npm run dev:admin` | root | Start admin web dev server (port 5173) |
| `npm run dev:miniapp` | root | Start mini program dev build |
| `npm run build` | root | Build all apps for production |
| `npm run prisma:generate` | `apps/server` | Generate Prisma client from schema |
| `npm run prisma:migrate` | `apps/server` | Apply database migrations |
| `npm run prisma:studio` | `apps/server` | Open Prisma Studio (DB browser) |

## Dev Login

Default credentials (after seeding):

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |

Pass `X-Tenant-Id: 1` header for all API requests.

## Backend Modules (15 total)

| Module | Endpoints | Status |
|--------|-----------|--------|
| Auth | `/api/auth/*` | ✅ JWT + admin/weapp login |
| Tenants | `/api/tenants` | ✅ CRUD |
| Stores | `/api/stores` | ✅ CRUD |
| Staff | `/api/admin-users` | ✅ CRUD (员工+教练) |
| Services | `/api/services` | ✅ CRUD |
| Customers | `/api/customers` | ✅ CRUD |
| Schedules | `/api/schedules` | ✅ CRUD + 容量管理 |
| Bookings | `/api/bookings` | ✅ 核心（三种支付路径 + 核销/取消） |
| Memberships | `/api/memberships` | ✅ 多类型会员卡 |
| Orders | `/api/orders` | ✅ CRUD（仅付费场景） |
| Payments | `/api/payments` | ✅ 支付发起 + 回调处理 |
| Ledger | `/api/ledger` | ✅ 只读查询（append-only） |
| Reports | `/api/reports` | ✅ 聚合统计 |
| Marketing | `/api/marketing` | ✅ 优惠券管理 |
| Common | `/api/health` | ✅ 基础设施 |

## Admin Pages (11 pages)

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | JWT auth |
| Dashboard | `/dashboard` | Real-time stats + recent bookings |
| Stores | `/stores` | Store management |
| Staff | `/staff` | Staff & coaches management |
| Services | `/classes` | Class/service management |
| Schedules | `/schedules` | Schedule management |
| Bookings | `/bookings` | Booking lifecycle (check-in/cancel) |
| Memberships | `/memberships` | Membership issuance & management |
| Finance | `/finance` | Orders + Ledger |
| Reports | `/reports` | KPI dashboard |
| Marketing | `/marketing` | Coupon templates |

## Mini Program Pages (6 pages)

| Page | Description |
|------|-------------|
| Home | Store selector + upcoming classes |
| Classes | Class list with type filter |
| Class Detail | Class info, coach, time slots |
| Booking Confirm | Summary + membership selection + submit |
| My Bookings | Upcoming/history tabs with cancel |
| Profile | User info + memberships |

## Documentation

- [Startup Guide](Docs/STARTUP.zh.md)
- [Development Log](Docs/DEV_LOG.md) — Progress tracking and design decisions
- [PRD](Docs/PRD.md) — Product requirements and scope
- [Architecture](Docs/ARCHITECTURE.md) — System design and module overview
- [Database Model](Docs/DATABASE_MODEL.md) — Schema, tables, and relationships
- [API Catalog](Docs/API_CATALOG.md) — REST endpoint reference
- [Frontend Design System](Docs/FRONTEND_DESIGN_SYSTEM.md) — UI components and tokens

## License

MIT
