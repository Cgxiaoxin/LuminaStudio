# LuminaStudio v1 PRD

## 1. Product Vision

LuminaStudio is a multi-tenant operations SaaS for small and mid-sized Pilates and yoga studios. The first release focuses on one thing: help a studio run its daily business loop reliably.

The product should let an operator configure a studio, publish classes, receive bookings, take payment, check clients in, and review the basic business result without juggling spreadsheets or chat threads.

## 2. Product Principles

- Keep the first release narrow and operational
- Optimize for repeated daily use, not marketing polish
- Make tenant isolation explicit from day one
- Keep the client app short and task-focused
- Keep the admin app dense, fast, and structured

## 3. Target Users and Roles

### 3.1 Studio owner

- Creates the tenant and studio
- Configures the business baseline
- Reviews income and booking performance
- Manages roles and permissions

### 3.2 Operations staff / front desk

- Manages bookings and check-ins
- Helps clients with cancellation or schedule changes
- Handles class capacity and attendance operations

### 3.3 Coach

- Views assigned schedule
- Checks class attendance
- Reviews upcoming sessions and client notes

### 3.4 Client

- Browses classes and coaches
- Books sessions
- Pays for classes or packs
- Reviews bookings and training history

## 4. v1 Product Scope

### 4.1 Admin Web Scope

- Tenant setup and studio profile
- Store-level operating settings
- Staff, coach, and role management
- Class, service, and package management
- Scheduling and capacity management
- Booking list and check-in management
- Membership card and class pack management
- Payment, ledger, and refund viewing
- Business dashboard and basic reports
- Coupon template management, kept light

### 4.2 Client Mini Program Scope

- Login and phone binding
- Class list and class detail
- Coach browsing
- Schedule browsing
- Booking creation and cancellation
- Payment completion
- My bookings list
- Training history view
- Membership and package view
- Coupon view

## 5. v1 Out of Scope

- Cross-city or marketplace-style aggregation
- Heavy CRM automation
- Payroll, inventory, and accounting system replacement
- Multi-app launch
- Cross-studio credits or marketplace memberships
- Complex recommendation engines
- Custom branding CMS for every screen

## 6. Core User Flows

### 6.1 Studio activation flow

1. Owner creates tenant
2. Owner creates one or more stores
3. Owner adds staff and coaches
4. Owner publishes classes and schedules
5. The studio starts accepting bookings

### 6.2 Client booking flow

1. Client opens the mini program
2. Client views classes or coaches
3. Client selects an available schedule slot
4. Client submits booking
5. Client pays or uses membership benefits
6. Booking becomes active
7. Client checks in at the studio

### 6.3 Operations flow

1. Front desk opens the booking list
2. Front desk filters by day, store, coach, or status
3. Front desk confirms arrivals or cancels bookings
4. Coach checks attendance or notes
5. Owner reviews performance on the dashboard

## 7. Functional Requirements

### 7.1 Tenant and store management

- A tenant is the top-level business container
- Each tenant can manage one or more stores
- Stores store address, business hours, status, and contact details
- Studio owners can update branding, basic profile, and operational settings

### 7.2 Staff and coach management

- The system must support owner, admin, staff, and coach roles
- Each staff record must belong to exactly one tenant
- Coaches need profile data such as name, avatar, intro, contact, and status
- Staff permissions must be scoped by role and store access

### 7.3 Class and service management

- The system must support group classes and private sessions
- Classes need price, duration, category, status, and coach assignment
- The admin can publish, unpublish, edit, and archive classes
- Classes may be linked to sellable products or packages

### 7.4 Scheduling and capacity

- The system must support schedule slots with start time, end time, capacity, and status
- A schedule slot must reference one store, one class, and one coach
- The schedule view must support day-based and calendar-based browsing
- Capacity changes must reflect immediately in booking availability

### 7.5 Booking management

- Clients can create bookings only for open schedule slots
- Booking must store client, schedule, class, store, and status
- Booking can be canceled according to business rules
- Staff can check in a booking
- Booking history must remain visible after completion or cancellation

### 7.6 Membership and package management

- The first release must support a lightweight class pack or membership card model
- Memberships can be sold as class packs or stored-value products
- The system must record benefit usage and remaining balances
- Membership consumption must be traceable in the ledger

### 7.7 Payment and refund management

- The system must support payment initiation and payment callback handling
- A payment record must link to an order and a booking or package purchase
- Successful payment updates order status and creates ledger records
- Refunds must create negative or reversing ledger entries

### 7.8 Reporting

- The dashboard must show today’s bookings, check-ins, and revenue
- Reports must support date ranges at least for day and week in v1
- Reports must use actual received money as the revenue source of truth
- Reports must include booking counts, attendance counts, and coach performance basics

### 7.9 Coupon and marketing

- Coupon templates can be created and assigned to clients
- v1 coupons are simple and should not require a full marketing automation engine
- Coupon usage must be visible in client and admin views

## 8. Business Rules

- Every record belongs to a tenant
- Some records also belong to a store
- A booking cannot exist without a schedule
- A payment success event is required before attendance can be finalized
- A check-in must write to the ledger
- Refunds must reverse financial impact through ledger records
- A client should not be able to book over capacity
- Closed or canceled schedules cannot accept new bookings

## 9. State Definitions

### 9.1 Booking status

- `CREATED`
- `CONFIRMED`
- `CHECKED_IN`
- `COMPLETED`
- `CANCELED`

### 9.2 Payment status

- `PENDING`
- `PAID`
- `REFUNDED`
- `FAILED`

### 9.3 Membership status

- `ACTIVE`
- `EXHAUSTED`
- `EXPIRED`
- `CANCELED`

### 9.4 Schedule status

- `OPEN`
- `FULL`
- `CANCELED`
- `ARCHIVED`

## 10. Non-Functional Requirements

- Tenant-scoped data access must be enforced in backend queries
- Core admin list pages should load quickly and support filtering
- Client booking flow should be short enough to finish in under 3 minutes
- Payment callbacks must be idempotent
- Audit fields must be present on core entities
- The system should remain operable if a third-party payment or notification service is temporarily unavailable

## 11. Success Metrics

- A new studio can be configured and ready to accept bookings within one day
- Most client booking flows finish without manual assistance
- Staff can complete check-in operations from the booking list without leaving the page
- Owners can understand the day’s revenue and attendance at a glance

## 12. Risks and Open Questions

- Whether each studio needs one or multiple stores in v1
- Whether membership should start as class pack only or also include stored value
- Whether coaches need their own login in v1 or can be staff-scoped only
- Whether the first payment integration should be WeChat-only or abstracted for future gateways

## 13. v1 Deliverables

- Admin web app
- Client mini program
- Backend API
- Database schema
- Basic reporting screens
- Minimal documentation for setup and launch
