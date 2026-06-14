# LuminaStudio

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
├── Docs/           # PRD, architecture, DB model, API catalog, design system
├── package.json    # Workspace root
└── tsconfig.base.json
```

Backend modules: auth, tenants, stores, staff, coaches, customers, services, schedules, bookings, memberships, orders, payments, ledger, reports, marketing.

## Prerequisites

- Node.js >= 18.18.0
- MySQL database
- WeChat developer account (for mini program)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp apps/server/.env.example apps/server/.env
# Edit apps/server/.env with your database URL, JWT secret, and WeChat credentials

# 3. Generate Prisma client and run migrations
npm run prisma:generate
npm run prisma:migrate

# 4. Start development servers
npm run dev:server   # API at http://localhost:3000/api
npm run dev:admin    # Admin at http://localhost:5173
npm run dev:miniapp  # WeChat mini program (via Taro)
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev:server` | Start NestJS dev server |
| `npm run dev:admin` | Start admin web dev server |
| `npm run dev:miniapp` | Start mini program dev build |
| `npm run build` | Build all apps for production |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |

## Documentation

- [PRD](Docs/PRD.md) — Product requirements and scope
- [Architecture](Docs/ARCHITECTURE.md) — System design and module overview
- [Database Model](Docs/DATABASE_MODEL.md) — Schema, tables, and relationships
- [API Catalog](Docs/API_CATALOG.md) — REST endpoint reference
- [Frontend Design System](Docs/FRONTEND_DESIGN_SYSTEM.md) — UI components and tokens

## License

MIT
