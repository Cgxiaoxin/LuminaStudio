# LuminaStudio Frontend Design System

## 1. Context

LuminaStudio has two frontend surfaces:

- Admin web: a dense operations console for owners, front desk staff, and coaches
- Client mini program: a short mobile flow for class discovery, booking, payment, and personal records

The frontend design should feel calm, operational, and repeat-use friendly. It should not look like a marketing landing page. Screens should prioritize scanability, clear hierarchy, fast actions, and trustworthy business data.

## 2. Design Principles

- Operations first: admin pages should favor tables, filters, status tags, and fast actions
- Mobile task focus: mini program pages should keep each screen to one primary decision
- State clarity: loading, empty, error, disabled, success, and partial states must be designed before implementation
- Tenant awareness: admin UI should always make current tenant/store context visible
- Low visual noise: use restrained color, compact spacing, and consistent controls

## 3. Primary Flows

## Flow: Admin daily booking operations

### Overview

Goal: Front desk staff checks the day’s bookings and handles arrivals, cancellations, and notes.

User Story: As front desk staff, I want to manage today’s bookings from one page so that studio arrivals are handled quickly.

Trigger: User opens `Bookings` from the admin sidebar.

### Entry Points

Users can enter this flow from:

- Dashboard today booking card
- Sidebar `Bookings`
- Schedule detail booking list

### Prerequisites

Before starting this flow, user must:

- Be authenticated as owner, admin, staff, or coach
- Have tenant context
- Have access to the selected store

### Steps

#### Step 1: Filter bookings

Screen/Component: Booking management page

User Action:

- Select date, store, coach, class, or status filters
- Search by client phone/name

System Response:

- Updates table data
- Shows loading state during fetch
- Keeps filters visible after refresh if possible

Transitions:

- Success -> Booking table updates
- Empty -> Empty state with clear reset filters action
- Error -> Error banner with retry action

#### Step 2: Check in a client

Screen/Component: Booking table row action

User Action:

- Click check-in action on an eligible booking

System Response:

- Confirms action if payment or membership state needs attention
- Updates booking status to `CHECKED_IN`
- Writes ledger entry through backend
- Shows success feedback

Transitions:

- Success -> Row status changes immediately after API success
- Conflict -> Show latest server state and refresh row
- Error -> Keep row unchanged and show retry

#### Step 3: Cancel a booking

Screen/Component: Booking cancel dialog

User Action:

- Choose cancel reason
- Confirm cancellation

System Response:

- Updates booking status to `CANCELED`
- Shows cancellation timestamp and reason

### Error Handling

| Error Type | Trigger | User Message | Recovery Action |
|------------|---------|--------------|-----------------|
| Validation | Missing cancel reason | Show inline field error | Complete field and retry |
| Permission | Role cannot check in | Access denied | Ask owner/admin |
| Conflict | Booking already changed | Booking was updated elsewhere | Refresh row |
| Network | Request failed | Could not update booking | Retry |

### Accessibility

- Table actions must be keyboard reachable
- Filter inputs must have visible labels
- Dialog focus must move into modal and return to trigger on close
- Status changes should be announced through toast or live region

## Flow: Client booking

### Overview

Goal: Client books a class or private session from the mini program.

User Story: As a client, I want to choose a class and available time slot so that I can reserve training time quickly.

Trigger: User opens Home, Class List, or a coach detail entry.

### Entry Points

Users can enter this flow from:

- Home recommended class
- Class list
- Coach profile
- My bookings rebook action

### Prerequisites

Before starting this flow, user must:

- Have client session or complete login during flow
- Have a selected tenant/store context
- Select a schedule with available capacity

### Steps

#### Step 1: Browse class

Screen/Component: Class list and class detail

User Action:

- Filter class type
- Open class detail

System Response:

- Shows class description, coach, price, duration, and available slots

Transitions:

- Slot available -> Continue to booking confirmation
- No slot -> Show empty slot state with alternative dates

#### Step 2: Confirm booking

Screen/Component: Booking confirmation

User Action:

- Confirm selected slot
- Choose membership benefit or payment

System Response:

- Validates schedule capacity
- Creates booking or order intent

Transitions:

- Membership available -> Confirm booking
- Payment needed -> Open payment flow
- Capacity full -> Return to class detail with updated availability

#### Step 3: Payment result

Screen/Component: Payment result page

User Action:

- Complete payment in WeChat

System Response:

- Shows success, pending, or failure state
- Links to My Bookings on success

### Edge Cases

| Scenario | Handling |
|----------|----------|
| Session expires | Prompt login and resume selected class if possible |
| Slot becomes full | Show updated availability and alternate slots |
| Payment pending | Show pending result and allow refresh |
| Payment failed | Allow retry or return to class detail |
| User has valid class pack | Prefer benefit usage over payment |

## 4. Core Components

## Component: AppShell

### Purpose

Provides admin app navigation, tenant/store context, and page layout.

### Variants

- `admin`: sidebar layout for desktop operations
- `mobile`: compact top navigation for narrow viewports

### States

| State | Visual | Behavior |
|-------|--------|----------|
| Default | Sidebar + content panel | Shows current page |
| Collapsed | Icon navigation | Saves horizontal space |
| Loading | Page-level skeleton | Used while auth context resolves |
| Access denied | Clear permission message | Blocks unauthorized content |

### Accessibility

- Sidebar links must expose current route state
- Main content must be reachable through keyboard navigation
- Store switcher must be label-backed

## Component: DataTable

### Purpose

Reusable admin table for bookings, clients, classes, payments, and ledger entries.

### Variants

- `default`: paginated table with filters
- `selectable`: batch action support
- `readonly`: report/detail mode

### States

| State | Visual | Behavior |
|-------|--------|----------|
| Loading | Skeleton rows | Keeps table shape stable |
| Empty | Empty message + reset/create action | Avoids blank panels |
| Error | Inline error block | Retry action available |
| Filtered | Filter chips visible | Reset filters available |

### Responsive Behavior

- Desktop: table remains primary view
- Tablet: hide lower-priority columns first
- Mobile: switch to stacked list only when table becomes unreadable

## Component: StatusTag

### Purpose

Shows schedule, booking, payment, membership, and coupon states consistently.

### Variants

- `success`: completed, paid, active
- `warning`: pending, created
- `danger`: canceled, failed, expired
- `neutral`: archived, inactive

### Accessibility

- Do not rely on color alone
- Tag text must always include the status label

## Component: BookingCard

### Purpose

Mobile-friendly booking summary for mini program and narrow admin states.

### States

| State | Visual | Behavior |
|-------|--------|----------|
| Upcoming | Clear time and class | Primary action is view details |
| Checked in | Success tag | No primary mutation action |
| Canceled | Muted content | Rebook action if applicable |
| Pending payment | Warning tag | Payment retry action |

## Component: PrimaryAction

### Purpose

Consistent main action button across admin and mini program surfaces.

### Rules

- One primary action per decision area
- Use icons for admin tooling actions where available
- Do not use disabled buttons without explaining why nearby
- Loading state must prevent duplicate submission

## 5. Design Tokens

## Design Tokens: LuminaStudio

### Overview

Purpose: shared visual rules for admin and mini program implementation.

Theme Support: light only for v1.

CSS Strategy: CSS variables in admin, SCSS variables or constants in mini program.

### Colors

```typescript
const colors = {
  background: "#f6f7f4",
  surface: "#ffffff",
  surfaceMuted: "#eef1ea",
  ink: "#17211c",
  inkMuted: "#667268",
  border: "#dce3dc",
  primary: "#2e6f57",
  primaryStrong: "#17211c",
  accent: "#d6ef71",
  success: "#1f8a5b",
  warning: "#c77700",
  danger: "#c93d32",
  info: "#2f6f9f",
};
```

### Typography

- Admin: compact system sans stack with 14px base text
- Mini program: system mobile font with 28rpx base text
- Headings should be functional and compact, not hero-sized inside work surfaces
- Letter spacing is 0

### Spacing

- Admin page padding: 24px to 32px
- Admin card/panel radius: max 8px
- Mini program page padding: 32rpx
- Mini program panel radius: 12rpx
- Dense tables should use 40px to 48px row heights

### Motion

- Hover/focus transitions: 120ms to 160ms
- Page skeletons should avoid layout shift
- Avoid decorative motion in operational screens

### Status Mapping

| Semantic | Color Role | Used For |
|----------|------------|----------|
| Success | `success` | paid, checked-in, active |
| Warning | `warning` | pending, created, low balance |
| Danger | `danger` | failed, canceled, expired |
| Info | `info` | system notices, neutral guidance |

## 6. Engineering Handoff

### Implementation target

- Admin web: React + Vite + Ant Design
- Client app: Taro + React

### React implementation rules

- Keep route pages thin and compose feature components below them
- Avoid boolean prop proliferation; prefer explicit variants or composition
- Use direct imports for icons and utilities
- Keep expensive list/table work outside render hot paths when data grows
- Use stable URL/filter state for admin list pages

### Acceptance Criteria

- Admin shell uses persistent navigation and clear current route state
- Core list pages include loading, empty, error, and filtered states before full API integration
- Mini program booking flow has clear success, failure, and pending states
- UI text fits on mobile and desktop without overlap
- Status colors never communicate meaning without text
- Frontend implementation remains aligned with `Docs/PRD.md`, `Docs/ARCHITECTURE.md`, and this file
