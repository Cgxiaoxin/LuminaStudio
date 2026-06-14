# LuminaStudio Database Model

## 1. Model Design Rules

- Use `tenantId` on every core record
- Use `storeId` when a record belongs to a particular store
- Add `createdAt`, `updatedAt`, and `deletedAt` where soft delete is needed
- Keep money fields as decimal values, not floats
- Make payment callbacks and booking transitions idempotent

## 2. Core Enums

- `TenantStatus`: `ACTIVE`, `SUSPENDED`
- `StoreStatus`: `ACTIVE`, `INACTIVE`
- `Role`: `OWNER`, `ADMIN`, `STAFF`, `COACH`
- `UserStatus`: `ACTIVE`, `DISABLED`
- `ServiceType`: `GROUP_CLASS`, `PRIVATE_SESSION`, `PACKAGE`, `PRODUCT`
- `ScheduleStatus`: `OPEN`, `FULL`, `CANCELED`, `ARCHIVED`
- `BookingStatus`: `CREATED`, `CONFIRMED`, `CHECKED_IN`, `COMPLETED`, `CANCELED`
- `OrderStatus`: `PENDING`, `PAID`, `REFUNDED`, `CANCELED`, `FAILED`
- `PaymentStatus`: `PENDING`, `PAID`, `REFUNDED`, `FAILED`
- `LedgerType`: `RECHARGE`, `CONSUME`, `WRITE_OFF`, `REFUND`, `ADJUSTMENT`
- `CouponStatus`: `ACTIVE`, `INACTIVE`, `EXPIRED`
- `MembershipStatus`: `ACTIVE`, `EXHAUSTED`, `EXPIRED`, `CANCELED`

## 3. Tables

### 3.1 tenants

- `id`
- `name`
- `code`
- `status`
- `brandName`
- `logoUrl`
- `contactPhone`
- `createdAt`
- `updatedAt`

Indexes:
- unique `code`
- unique `name` optional if needed by business rules

### 3.2 stores

- `id`
- `tenantId`
- `name`
- `code`
- `address`
- `phone`
- `businessHours`
- `status`
- `createdAt`
- `updatedAt`

Indexes:
- unique `(tenantId, code)`
- index `(tenantId, status)`

### 3.3 admin_users

- `id`
- `tenantId`
- `storeId` nullable
- `username`
- `passwordHash`
- `role`
- `displayName`
- `status`
- `lastLoginAt`
- `createdAt`
- `updatedAt`

Indexes:
- unique `(tenantId, username)`
- index `(tenantId, role)`

### 3.4 coaches

- `id`
- `tenantId`
- `storeId` nullable
- `name`
- `avatarUrl`
- `bio`
- `phone`
- `status`
- `sortOrder`
- `createdAt`
- `updatedAt`

Indexes:
- index `(tenantId, storeId, status)`
- index `(tenantId, sortOrder)`

### 3.5 clients

- `id`
- `tenantId`
- `openid` nullable
- `unionId` nullable
- `phone` nullable
- `nickname`
- `avatarUrl`
- `status`
- `tags`
- `createdAt`
- `updatedAt`

Indexes:
- unique `(tenantId, openid)` when present
- unique `(tenantId, phone)` when present

### 3.6 services

- `id`
- `tenantId`
- `storeId` nullable
- `coachId` nullable
- `name`
- `type`
- `description`
- `price`
- `durationMinutes`
- `status`
- `sortOrder`
- `createdAt`
- `updatedAt`

Indexes:
- index `(tenantId, storeId, status)`
- index `(tenantId, type)`

### 3.7 schedules

- `id`
- `tenantId`
- `storeId`
- `serviceId`
- `coachId`
- `startAt`
- `endAt`
- `capacity`
- `bookedCount`
- `status`
- `note`
- `createdAt`
- `updatedAt`

Indexes:
- index `(tenantId, storeId, startAt)`
- index `(tenantId, coachId, startAt)`
- index `(tenantId, serviceId, startAt)`

### 3.8 bookings

- `id`
- `tenantId`
- `storeId`
- `clientId`
- `serviceId`
- `scheduleId`
- `status`
- `bookingNo`
- `paidAmount`
- `usedMembershipId` nullable
- `checkinAt` nullable
- `canceledAt` nullable
- `cancelReason` nullable
- `createdAt`
- `updatedAt`

Indexes:
- unique `bookingNo`
- index `(tenantId, storeId, status, createdAt)`
- index `(tenantId, clientId, createdAt)`
- index `(tenantId, scheduleId)`

### 3.9 memberships

- `id`
- `tenantId`
- `storeId` nullable
- `clientId`
- `name`
- `type`
- `totalTimes`
- `remainingTimes`
- `balanceAmount`
- `status`
- `startedAt`
- `expiredAt`
- `createdAt`
- `updatedAt`

Indexes:
- index `(tenantId, clientId, status)`
- index `(tenantId, expiredAt)`

### 3.10 orders

- `id`
- `tenantId`
- `storeId`
- `clientId`
- `serviceId` nullable
- `membershipId` nullable
- `orderNo`
- `status`
- `orderType`
- `originalAmount`
- `discountAmount`
- `paidAmount`
- `payChannel` nullable
- `paidAt` nullable
- `refundedAt` nullable
- `createdAt`
- `updatedAt`

Indexes:
- unique `orderNo`
- index `(tenantId, storeId, status, createdAt)`
- index `(tenantId, clientId, createdAt)`

### 3.11 payments

- `id`
- `tenantId`
- `storeId`
- `orderId`
- `channel`
- `status`
- `amount`
- `transactionId` nullable
- `requestPayload` JSON nullable
- `notifyPayload` JSON nullable
- `createdAt`
- `updatedAt`

Indexes:
- unique `(channel, transactionId)` when present
- index `(tenantId, orderId)`

### 3.12 ledger_entries

- `id`
- `tenantId`
- `storeId`
- `clientId` nullable
- `orderId` nullable
- `paymentId` nullable
- `bookingId` nullable
- `membershipId` nullable
- `type`
- `amount`
- `occurredAt`
- `source`
- `remark`
- `createdAt`

Indexes:
- index `(tenantId, storeId, occurredAt)`
- index `(tenantId, type, occurredAt)`

### 3.13 coupon_templates

- `id`
- `tenantId`
- `name`
- `description`
- `couponType`
- `discountValue`
- `minimumSpend`
- `validFrom`
- `validTo`
- `quota`
- `perUserLimit`
- `status`
- `createdAt`
- `updatedAt`

Indexes:
- index `(tenantId, status)`
- index `(tenantId, validTo)`

### 3.14 client_coupons

- `id`
- `tenantId`
- `storeId` nullable
- `clientId`
- `couponTemplateId`
- `status`
- `issuedAt`
- `usedAt` nullable
- `expiredAt` nullable
- `createdAt`

Indexes:
- index `(tenantId, clientId, status)`
- index `(tenantId, couponTemplateId)`

### 3.15 audit_logs

- `id`
- `tenantId`
- `storeId` nullable
- `actorType`
- `actorId` nullable
- `action`
- `entityType`
- `entityId`
- `beforeData` JSON nullable
- `afterData` JSON nullable
- `createdAt`

Indexes:
- index `(tenantId, createdAt)`
- index `(tenantId, entityType, entityId)`

## 4. Relationship Summary

- Tenant has many stores, admin users, coaches, clients, services, schedules, bookings, memberships, orders, payments, ledger entries, and coupons
- Store belongs to one tenant and can be linked to many schedules, bookings, and financial records
- Client can have many bookings, memberships, orders, payments, and coupons
- Service can have many schedules, bookings, and orders
- Schedule has many bookings
- Order has one payment or multiple payment attempts depending on implementation choice
- Ledger entries can reference booking, payment, membership, or order as needed

## 5. Implementation Notes

- Use enums for all status fields
- Keep booking and payment state transitions explicit in service logic
- Prefer append-only ledger records for financial history
- Soft delete only where business retention requires it
- Generate booking numbers and order numbers in application code or a dedicated sequence helper
