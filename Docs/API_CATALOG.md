# LuminaStudio API Catalog

## 1. API Design Rules

- Every authenticated request should resolve tenant context
- Admin and client authentication should use separate tokens or claims
- Write endpoints should be idempotent where payment callbacks or repeated actions may occur
- List endpoints should support pagination and common filters
- Response shapes should be stable and lean

## 2. Auth

### 2.1 Client login

- `POST /api/auth/weapp-login`
- Purpose: exchange a WeChat login code for a client session
- Request: `code`, optional profile fields
- Response: client token, profile, tenant/studio context if needed

### 2.2 Admin login

- `POST /api/auth/admin-login`
- Purpose: authenticate an admin or staff account
- Request: `username`, `password`
- Response: admin token, role, permissions, accessible stores

### 2.3 Current user

- `GET /api/auth/me`
- Purpose: fetch the current authenticated principal

## 3. Tenant and Store

### 3.1 Tenants

- `POST /api/tenants`
- `GET /api/tenants/:id`
- `PATCH /api/tenants/:id`
- `GET /api/tenants`

### 3.2 Stores

- `POST /api/stores`
- `GET /api/stores`
- `GET /api/stores/:id`
- `PATCH /api/stores/:id`
- `DELETE /api/stores/:id`

## 4. Staff and Coaches

### 4.1 Admin users

- `GET /api/admin-users`
- `POST /api/admin-users`
- `GET /api/admin-users/:id`
- `PATCH /api/admin-users/:id`
- `DELETE /api/admin-users/:id`

### 4.2 Coaches

- `GET /api/coaches`
- `POST /api/coaches`
- `GET /api/coaches/:id`
- `PATCH /api/coaches/:id`
- `DELETE /api/coaches/:id`

## 5. Clients

- `GET /api/clients`
- `GET /api/clients/:id`
- `PATCH /api/clients/:id`
- `PATCH /api/clients/me/phone`
- `GET /api/clients/me`

## 6. Services and Schedules

### 6.1 Services

- `GET /api/services`
- `POST /api/services`
- `GET /api/services/:id`
- `PATCH /api/services/:id`
- `DELETE /api/services/:id`

### 6.2 Schedules

- `GET /api/schedules`
- `POST /api/schedules`
- `GET /api/schedules/:id`
- `PATCH /api/schedules/:id`
- `DELETE /api/schedules/:id`

Filters:
- by date range
- by store
- by coach
- by service
- by status

## 7. Bookings

- `POST /api/bookings`
- `GET /api/bookings`
- `GET /api/bookings/my`
- `GET /api/bookings/:id`
- `POST /api/bookings/:id/checkin`
- `POST /api/bookings/:id/cancel`
- `PATCH /api/bookings/:id/confirm`

Booking requests should capture:
- clientId
- scheduleId
- serviceId
- storeId
- membershipId or payment intent info

## 8. Memberships

- `GET /api/memberships`
- `POST /api/memberships`
- `GET /api/memberships/:id`
- `PATCH /api/memberships/:id`
- `POST /api/memberships/:id/consume`
- `POST /api/memberships/:id/expire`

## 9. Orders and Payments

### 9.1 Orders

- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/my`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/cancel`

### 9.2 Payments

- `POST /api/payments/wechat/unified-order`
- `POST /api/payments/wechat/notify`
- `POST /api/payments/:id/refund`
- `GET /api/payments`
- `GET /api/payments/:id`

Important behavior:
- payment notify must be idempotent
- notify must update order and payment statuses together
- notify must write ledger entries after validation

## 10. Ledger and Finance

### 10.1 Ledger entries

- `GET /api/ledger`
- `POST /api/ledger`
- `GET /api/ledger/:id`

### 10.2 Finance overview

- `GET /api/finance/overview`
- `GET /api/finance/overview/trend`
- `GET /api/finance/transactions`
- `POST /api/finance/transactions`
- `PATCH /api/finance/transactions/:id`
- `DELETE /api/finance/transactions/:id`

## 11. Reports

- `GET /api/reports/dashboard`
- `GET /api/reports/bookings`
- `GET /api/reports/revenue`
- `GET /api/reports/coaches`
- `GET /api/reports/my-training`
- `GET /api/reports/rankings`

Query inputs should support:
- date range
- storeId
- coachId
- serviceId
- status

## 12. Coupons and Marketing

- `GET /api/marketing/coupons/templates`
- `POST /api/marketing/coupons/templates`
- `GET /api/marketing/coupons/templates/:id`
- `PATCH /api/marketing/coupons/templates/:id`
- `DELETE /api/marketing/coupons/templates/:id`
- `GET /api/marketing/coupons/my`
- `POST /api/marketing/coupons/issue`
- `POST /api/marketing/coupons/:id/use`

## 13. Admin Dashboard Data

- `GET /api/dashboard/summary`
- `GET /api/dashboard/bookings-today`
- `GET /api/dashboard/revenue-trend`
- `GET /api/dashboard/checkins-today`

## 14. Client Mini Program Data

- `GET /api/client/home`
- `GET /api/client/classes`
- `GET /api/client/classes/:id`
- `GET /api/client/coaches`
- `GET /api/client/my-bookings`
- `GET /api/client/my-memberships`
- `GET /api/client/my-training`

## 15. Cross-Cutting Requirements

- Pagination on list endpoints
- Error responses with stable error codes
- Role-based access checks on every admin endpoint
- Tenant context validation on every request that touches business data
- Consistent date formatting and money formatting across responses
