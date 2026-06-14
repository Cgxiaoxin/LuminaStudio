# LuminaStudio Architecture

## 1. System Overview

LuminaStudio is built as one backend service plus two frontends.

- Backend: unified API for admin and client apps
- Admin app: web operations console
- Client app: WeChat mini program first

## 2. Tech Stack

- Backend: NestJS + TypeScript
- ORM: Prisma
- Database: MySQL
- Admin app: React + Vite + Ant Design
- Client app: Taro + React + TypeScript
- State management: Zustand
- HTTP client: Axios

## 3. Architectural Principles

- Start with a modular monolith
- Keep tenant isolation as a first-class concern
- Separate business domains by module, not by microservice
- Make booking, payment, and check-in flows idempotent
- Keep admin UI optimized for throughput and scanning
- Keep client UI optimized for action completion

## 4. Backend Module Map

### 4.1 auth

- Login and logout
- JWT issuance and validation
- Role authorization
- Tenant and store context resolution

### 4.2 tenants

- Tenant creation and lifecycle
- Brand and business profile
- Tenant settings

### 4.3 stores

- Store CRUD
- Business hours and contact data
- Store-level operational settings

### 4.4 staff

- Admin users
- Coaches
- Front desk users
- Role and scope assignment

### 4.5 customers

- Client profile management
- Phone binding
- Tags and notes

### 4.6 services

- Classes
- Private sessions
- Packages and sellable items
- Price, duration, and publish status

### 4.7 schedules

- Schedule slot CRUD
- Capacity and availability
- Coach assignment
- Time-based filtering

### 4.8 bookings

- Booking creation
- Booking cancelation
- Booking confirmation
- Check-in and completion

### 4.9 memberships

- Class packs
- Stored value
- Benefit usage
- Remaining balance tracking

### 4.10 orders

- Order creation
- Order status lifecycle
- Link order to product or service

### 4.11 payments

- Payment order creation
- Payment callback processing
- Refund handling
- Idempotent callback updates

### 4.12 ledger

- Revenue ledger
- Check-in ledger
- Refund ledger
- Manual adjustment ledger

### 4.13 reports

- Daily dashboard
- Booking trend
- Revenue trend
- Coach performance summary

### 4.14 marketing

- Coupon templates
- Coupon issuance
- Coupon usage tracking

### 4.15 common

- DTOs
- Pagination helpers
- Error handling
- Time and money utilities
- Audit fields

## 5. Data Isolation Model

- `tenantId` is required on every core table
- `storeId` is required where store-level access matters
- Staff and coach access are constrained by tenant and store scope
- Query helpers should always accept tenant context explicitly

## 6. Database Model Plan

See [Database Model](DATABASE_MODEL.md) for the executable schema plan.

The schema should cover:

- Tenant and store hierarchy
- Staff and client identities
- Coaches and schedules
- Classes and bookings
- Orders, payments, and ledger
- Memberships and coupons
- Reporting-friendly timestamps and audit fields

## 7. API Catalog Plan

See [API Catalog](API_CATALOG.md) for the endpoint plan.

The API catalog should cover:

- Authentication
- Tenant and store setup
- Staff and coach management
- Classes and schedules
- Bookings and check-in
- Orders and payments
- Memberships and coupons
- Reports and dashboard data

## 8. Frontend Page Structure

### 8.1 Admin web

- Login
- Dashboard
- Tenant settings
- Store management
- Staff management
- Coach management
- Class management
- Schedule management
- Booking management
- Membership management
- Finance
- Reports
- Marketing
- System settings

### 8.2 Client mini program

- Home
- Class list
- Class detail
- Booking flow
- My bookings
- Membership center
- Payment result
- Training history
- Profile

## 9. Core State Machines

### 9.1 Booking

- `CREATED`
- `CONFIRMED`
- `CHECKED_IN`
- `COMPLETED`
- `CANCELED`

### 9.2 Payment

- `PENDING`
- `PAID`
- `REFUNDED`
- `FAILED`

### 9.3 Membership

- `ACTIVE`
- `EXHAUSTED`
- `EXPIRED`
- `CANCELED`

### 9.4 Schedule

- `OPEN`
- `FULL`
- `CANCELED`
- `ARCHIVED`

## 10. Implementation Order

1. Scaffold backend, admin app, and client app
2. Add authentication and tenant context
3. Add stores, staff, services, and schedules
4. Add booking, order, payment, and ledger flows
5. Add dashboard and management pages
6. Add reports and coupons
