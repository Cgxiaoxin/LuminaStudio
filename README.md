# LuminaStudio

LuminaStudio is a multi-tenant operations SaaS for small and mid-sized Pilates and yoga studios.

## Apps

- `apps/server`: NestJS API server
- `apps/admin`: React + Vite admin web app
- `apps/miniapp`: Taro + React WeChat mini program

## Docs

- [PRD](Docs/PRD.md)
- [Architecture](Docs/ARCHITECTURE.md)
- [Database Model](Docs/DATABASE_MODEL.md)
- [API Catalog](Docs/API_CATALOG.md)
- [Frontend Design System](Docs/FRONTEND_DESIGN_SYSTEM.md)

## Local development

```bash
npm install
npm run prisma:generate
npm run dev:server
npm run dev:admin
npm run dev:miniapp
```

