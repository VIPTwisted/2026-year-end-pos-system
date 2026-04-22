# NovaPOS Enterprise Clone Specification
*Version 1.0 — Build-Ready — April 2026*

---

## 1. Platform Executive Summary

NovaPOS is a sovereign, self-hosted retail OS replacing Microsoft Dynamics 365 (Business Central, Commerce, F&O, Supply Chain, Project Operations, HR, Customer Service). It runs on Next.js 15 App Router, TypeScript, Prisma ORM, SQLite (libsql), and Tailwind CSS 4. It is a dark-theme enterprise platform with the following design tokens:

| Token | Value |
|-------|-------|
| Background | `#0d0e24` |
| Card | `#16213e` |
| Borders | `rgba(99,102,241,0.15)` |
| Accent | `rgba(99,102,241,0.3)` |
| Text | `#e2e8f0` |
| Muted | `#94a3b8` |

All pages use: `TopBar` component (title / breadcrumb / actions), `FastTab` (details/summary collapsibles), pure SVG charts. No external chart libraries.

---

## 2. Full Platform Module Tree

All 38+ modules with routes, build status, and priority.

### Finance (22 modules)

| Route | Status | Priority |
|-------|--------|----------|
| `/finance/analytics` | Built | P0 |
| `/finance/vendor-payments` | Built | P0 |
| `/finance/cash-management` | Built | P0 |
| `/finance/lease-management` | Built | P1 |
| `/finance/credit-collections` | Built | P0 |
| `/finance/customer-invoicing` | Built | P0 |
| `/finance/expense-management` | Built | P1 |
| `/finance/cost-accounting` | Built | P1 |
| `/finance/cash-overview` | Built | P0 |
| `/finance/financial-insights` | Built | P0 |
| `/finance/ledger-budgets` | Built | P1 |
| `/finance/consolidations` | Built | P1 |
| `/finance/period-close` | Built | P1 |
| `/finance/fixed-assets` | Built | P1 |
| `/finance/general-journal` | Built | P0 |
| `/finance/bank-management` | Built | P0 |
| `/finance/budgets/management` | Built | P1 |
| `/finance/chart-of-accounts` | **PENDING** | P0 |
| `/finance/trial-balance` | **PENDING** | P0 |
| `/finance/tax-management` | **PENDING** | P0 |
| `/finance/intercompany` | **PENDING** | P2 |
| `/finance/revenue-recognition` | **PENDING** | P1 |

### Sales (9 modules)

| Route | Status | Priority |
|-------|--------|----------|
| `/sales/orders/new` | Built | P0 |
| `/sales/processing-inquiry` | Built | P0 |
| `/sales/quotes` | Built | P0 |
| `/sales/customers` | Built | P0 |
| `/sales/pricing` | Built | P1 |
| `/sales/customers/[id]` | **PENDING** | P0 |
| `/sales/orders/[id]` | **PENDING** | P0 |
| `/sales/returns` | **PENDING** | P0 |
| `/sales/deliveries` | **PENDING** | P1 |

### POS (6 modules)

| Route | Status | Priority |
|-------|--------|----------|
| `/pos/transaction` | Built (838 lines, full terminal) | P0 |
| `/pos/register-management` | **PENDING** | P0 |
| `/pos/cash-drawer` | **PENDING** | P0 |
| `/pos/gift-cards` | **PENDING** | P0 |
| `/pos/returns` | **PENDING** | P0 |
| `/pos/reports` | **PENDING** | P1 |

### Procurement (5 modules)

| Route | Status | Priority |
|-------|--------|----------|
| `/procurement/purchase-orders` | Built | P0 |
| `/procurement/vendors` | Built | P0 |
| `/procurement/vendors/[id]` | **PENDING** | P0 |
| `/procurement/purchase-orders/[id]` | **PENDING** | P0 |
| `/procurement/receiving` | **PENDING** | P0 |

### Inventory (8 modules)

| Route | Status | Priority |
|-------|--------|----------|
| `/inventory/management` | Built | P0 |
| `/inventory/product-variants` | Built | P0 |
| `/inventory/items` | Built | P0 |
| `/inventory/warehouse-management` | Built | P0 |
| `/inventory/items/[id]` | **PENDING** | P0 |
| `/inventory/transfers` | **PENDING** | P0 |
| `/inventory/cycle-count` | **PENDING** | P1 |
| `/inventory/adjustments` | **PENDING** | P1 |

### Manufacturing (5 modules)

| Route | Status | Priority |
|-------|--------|----------|
| `/manufacturing/production-floor` | Built | P1 |
| `/manufacturing/production-orders` | Built | P1 |
| `/manufacturing/bom` | **PENDING** | P1 |
| `/manufacturing/routes` | **PENDING** | P2 |
| `/manufacturing/quality` | **PENDING** | P1 |

### HR (12 modules)

| Route | Status | Priority |
|-------|--------|----------|
| `/hr/setup/parameters` | Built | P1 |
| `/hr/benefits` | Built | P1 |
| `/hr/leave-absence` | Built | P1 |
| `/hr/payroll` | Built | P1 |
| `/hr/resource-lifecycle` | Built | P1 |
| `/hr/workspace` | Built | P1 |
| `/hr/positions` | Built | P1 |
| `/hr/workers` | **PENDING** | P0 |
| `/hr/performance` | **PENDING** | P1 |
| `/hr/recruiting` | **PENDING** | P2 |
| `/hr/training` | **PENDING** | P2 |
| `/hr/payroll/configuration` | **PENDING** | P1 |

### Retail (5 modules)

| Route | Status | Priority |
|-------|--------|----------|
| `/retail/store-management` | Built | P0 |
| `/retail/retail-it` | Built | P1 |
| `/retail/store-financials` | Built | P0 |
| `/retail/channel-management` | **PENDING** | P1 |
| `/retail/replenishment` | **PENDING** | P1 |

### Projects (6 modules)

| Route | Status | Priority |
|-------|--------|----------|
| `/projects/resources/management` | Built | P1 |
| `/projects/list` | Built | P1 |
| `/projects/timesheets` | Built | P1 |
| `/projects/invoicing` | Built | P1 |
| `/projects/planning` | **PENDING** | P2 |
| `/projects/resources/[id]` | **PENDING** | P2 |

### Operations (3 modules)

| Route | Status | Priority |
|-------|--------|----------|
| `/operations/reservations` | Built | P1 |
| `/operations/fleet` | Built | P2 |
| `/operations/maintenance` | **PENDING** | P2 |

### Admin (13 modules)

| Route | Status | Priority |
|-------|--------|----------|
| `/admin/methodology` | Built | P2 |
| `/admin/compliance` | Built | P1 |
| `/admin/audit-workbench` | Built | P0 |
| `/admin/electronic-reporting` | Built | P1 |
| `/admin/global-address-book` | Built | P1 |
| `/admin/number-sequences` | Built | P1 |
| `/admin/data-management` | Built | P1 |
| `/admin/users` | Built | P0 |
| `/admin/workflow` | Built | P1 |
| `/admin/system-parameters` | Built | P0 |
| `/admin/currencies` | Built | P1 |
| `/admin/security-roles` | **PENDING** | P0 |
| `/admin/company-information` | **PENDING** | P1 |

### CRM (6 modules)

| Route | Status | Priority |
|-------|--------|----------|
| `/crm/leads/[id]` | Built | P0 |
| `/dashboard/crm` | Built | P0 |
| `/crm/leads` | **PENDING** | P0 |
| `/crm/contacts` | **PENDING** | P0 |
| `/crm/opportunities` | **PENDING** | P0 |
| `/crm/cases` | **PENDING** | P1 |

### Loyalty & Promotions (all PENDING)

| Route | Status | Priority |
|-------|--------|----------|
| `/loyalty/program` | **PENDING** | P1 |
| `/loyalty/members` | **PENDING** | P1 |
| `/loyalty/redemption` | **PENDING** | P1 |
| `/promotions/engine` | **PENDING** | P1 |
| `/promotions/coupons` | **PENDING** | P1 |
| `/promotions/price-lists` | **PENDING** | P1 |

### eCommerce / Omnichannel (all PENDING)

| Route | Status | Priority |
|-------|--------|----------|
| `/ecommerce/orders` | **PENDING** | P2 |
| `/ecommerce/sync` | **PENDING** | P2 |
| `/ecommerce/products` | **PENDING** | P2 |

---

## 3. Full Navigation / Menu Tree

Complete `Sidebar.tsx` structure. Every route listed must exist in the sidebar nav array.

```
NOVAPOS
├── Dashboard
│   ├── Financials              /dashboard/financials
│   └── CRM                    /dashboard/crm
├── Finance
│   ├── Analytics              /finance/analytics
│   ├── General Journal        /finance/general-journal
│   ├── Chart of Accounts      /finance/chart-of-accounts
│   ├── Trial Balance          /finance/trial-balance
│   ├── Fixed Assets           /finance/fixed-assets
│   ├── Bank Management        /finance/bank-management
│   ├── Cash Management        /finance/cash-management
│   ├── Cash Overview          /finance/cash-overview
│   ├── Customer Invoicing     /finance/customer-invoicing
│   ├── Vendor Payments        /finance/vendor-payments
│   ├── Credit & Collections   /finance/credit-collections
│   ├── Expense Management     /finance/expense-management
│   ├── Cost Accounting        /finance/cost-accounting
│   ├── Budgets                /finance/budgets/management
│   ├── Ledger Budgets         /finance/ledger-budgets
│   ├── Financial Insights     /finance/financial-insights
│   ├── Consolidations         /finance/consolidations
│   ├── Period Close           /finance/period-close
│   ├── Lease Management       /finance/lease-management
│   ├── Tax Management         /finance/tax-management
│   └── Revenue Recognition    /finance/revenue-recognition
├── Sales
│   ├── Customers              /sales/customers
│   ├── Sales Orders           /sales/processing-inquiry
│   ├── New Sales Order        /sales/orders/new
│   ├── Quotations             /sales/quotes
│   ├── Pricing                /sales/pricing
│   ├── Returns                /sales/returns
│   └── Deliveries             /sales/deliveries
├── Procurement
│   ├── Vendors                /procurement/vendors
│   ├── Purchase Orders        /procurement/purchase-orders
│   └── Receiving              /procurement/receiving
├── Inventory
│   ├── Items                  /inventory/items
│   ├── Product Variants       /inventory/product-variants
│   ├── Inventory Management   /inventory/management
│   ├── Warehouse Management   /inventory/warehouse-management
│   ├── Transfer Orders        /inventory/transfers
│   ├── Cycle Count            /inventory/cycle-count
│   └── Adjustments            /inventory/adjustments
├── Manufacturing
│   ├── Production Floor       /manufacturing/production-floor
│   ├── Production Orders      /manufacturing/production-orders
│   ├── Bill of Materials      /manufacturing/bom
│   ├── Routes                 /manufacturing/routes
│   └── Quality Management     /manufacturing/quality
├── Retail
│   ├── Store Management       /retail/store-management
│   ├── Channel Management     /retail/channel-management
│   ├── Store Financials       /retail/store-financials
│   ├── Retail IT              /retail/retail-it
│   └── Replenishment          /retail/replenishment
├── POS
│   ├── Terminal               /pos/transaction
│   ├── Register Management    /pos/register-management
│   ├── Gift Cards             /pos/gift-cards
│   ├── Returns                /pos/returns
│   └── POS Reports            /pos/reports
├── CRM
│   ├── Leads                  /crm/leads
│   ├── Contacts               /crm/contacts
│   └── Opportunities          /crm/opportunities
├── Customer Service
│   └── Cases                  /crm/cases
├── Loyalty & Promotions
│   ├── Loyalty Program        /loyalty/program
│   ├── Members                /loyalty/members
│   ├── Promotions Engine      /promotions/engine
│   └── Coupons                /promotions/coupons
├── Projects
│   ├── Projects               /projects/list
│   ├── Timesheets             /projects/timesheets
│   ├── Invoicing              /projects/invoicing
│   ├── Planning               /projects/planning
│   └── Resources              /projects/resources/management
├── Operations
│   ├── Reservations           /operations/reservations
│   └── Fleet                  /operations/fleet
├── Human Resources
│   ├── HR Workspace           /hr/workspace
│   ├── Positions              /hr/positions
│   ├── Workers                /hr/workers
│   ├── Benefits               /hr/benefits
│   ├── Leave & Absence        /hr/leave-absence
│   ├── Payroll                /hr/payroll
│   ├── Resource Lifecycle     /hr/resource-lifecycle
│   ├── Performance            /hr/performance
│   ├── Recruiting             /hr/recruiting
│   └── Training               /hr/training
├── eCommerce
│   ├── Orders                 /ecommerce/orders
│   └── Product Sync           /ecommerce/sync
└── Administration
    ├── Users                  /admin/users
    ├── Security Roles         /admin/security-roles
    ├── Workflow               /admin/workflow
    ├── System Parameters      /admin/system-parameters
    ├── Currencies             /admin/currencies
    ├── Number Sequences       /admin/number-sequences
    ├── Global Address Book    /admin/global-address-book
    ├── Data Management        /admin/data-management
    ├── Electronic Reporting   /admin/electronic-reporting
    ├── Audit Workbench        /admin/audit-workbench
    ├── Compliance             /admin/compliance
    └── Methodology            /admin/methodology
```

---

## 4. POS Transaction Screen — Full Forensic Specification

### 4.1 Screen Identity

| Field | Value |
|-------|-------|
| Screen Name | POS Transaction Terminal |
| Route | `/pos/transaction` |
| File | `src/app/pos/transaction/page.tsx` (~838 lines) |
| Purpose | Live sale processing: scan items, apply discounts, collect payment, issue receipt |
| Business Purpose | Revenue capture, inventory decrement, tender reconciliation, loyalty accumulation |
| User Types | Cashier, Senior Cashier, Manager (overrides) |
| Frequency | Every customer interaction — highest-frequency screen in the platform |
| Mission Criticality | CRITICAL — revenue-generating, cannot fail silently |
| Register-Side | Yes (store floor / kiosk) |
| Upstream | Product catalog, customer CRM, loyalty, inventory, promotions engine |
| Downstream | Inventory decrement, payment settlement, receipt issuance, loyalty credit, audit log |

### 4.2 Full UI Inventory

#### Left Icon Sidebar (48px wide, fixed)

| Icon | Label | Action | Minimum Permission |
|------|-------|--------|--------------------|
| Grid | Home / Dashboard | Navigate to POS home | Cashier |
| Cart | Current Transaction | Return to active transaction | Cashier |
| History | Transaction History | Recent transactions list | Senior Cashier |
| User | Customer Management | Customer lookup / assign | Cashier |
| Barcode | Quick Scan | Activate scan input field | Cashier |
| Settings | POS Settings | Device / drawer config | Manager |

#### Transaction Header Bar

| Element | Detail |
|---------|--------|
| TXN ID | Auto-generated: `TXN-YYYYMMDD-NNNN` (4-digit zero-padded sequence per store per day) |
| Register ID | `REG-001` pulled from device config; configurable per deployment |
| Cashier Name | Pulled from session context |
| Date / Time | Live clock, updates every second |
| Customer Field | Defaults to "Walk-in Customer"; click opens search modal |
| Search / Scan Bar | Accepts barcode, SKU, description; debounced 200ms for keyboard entry; instant on HID scanner |
| Dropdown Results | Shows up to 8 matches: SKU / Name / Price / Stock / [Add] button |

#### Lines / Payments Tab Strip

- **Lines** tab (default active): renders cart line items
- **Payments** tab: renders applied tenders with tender type, amount, auth code

#### Cart / Line Items Table

| Column | Notes |
|--------|-------|
| Item Name | Truncated at 32 chars, full name on hover tooltip |
| SKU | Monospace, 12px |
| Qty | Inline edit on click; validates against available inventory |
| Unit Price | Manager-only edit; price override logs to audit |
| Discount | % or $ — respects role permission thresholds |
| Net Price | Unit Price after discount |
| Tax | Rate × Net Price per line |
| Ext. Total | Net Price × Qty + Tax |
| Delete | X icon; calls void-line logic |

Behaviors:
- Row click: selects row, activates right-panel contextual actions
- Duplicate SKU scan: increments qty on existing row, does not add new row
- Manual qty via numpad: validates against `available_qty`; shows warning if insufficient

#### Recommended Products Panel

Displayed when cart is empty or when user clicks PRODUCTS tab. 4-column grid layout.

| Product | Price |
|---------|-------|
| Artisan Coffee | $5.99 |
| Bluetooth Headphones | $49.99 |
| Cold Brew | $5.49 |
| Green Tea | $3.49 |

Each card: product thumbnail (80×80px), name, price, [+] add button. Cards sourced from product catalog; the 4 shown above are seed defaults.

#### Numpad (right panel, always visible)

```
[ 7 ] [ 8 ] [ 9 ] [ ⌫ ]
[ 4 ] [ 5 ] [ 6 ] [ ± ]
[ 1 ] [ 2 ] [ 3 ] [ × ]
[ 0 ] [ . ] [ABC] 
[        ENTER         ]  ← green, full width
```

Numpad context (what it controls depends on active selection):
- Selected line row: applies to qty
- Price override mode: applies to unit price
- Discount mode: applies to discount amount
- Tender amount input: applies to payment amount

#### Footer Totals Bar (fixed bottom)

| Label | Value |
|-------|-------|
| LINES | Count of non-voided line items |
| DISCOUNTS | Sum of all line + transaction discounts |
| SUBTOTAL | Sum of all line net prices (before tax) |
| TAX (8.25%) | Calculated tax — rate shown dynamically from TaxJurisdiction |
| PAYMENTS | Sum of all tendered amounts |
| AMOUNT DUE | SUBTOTAL + TAX - PAYMENTS |

#### Right Action Panel (vertical button column)

**Top section — Line-Item Actions** (active on selected row):

| Button | Action | Permission |
|--------|--------|-----------|
| Set quantity | Open qty input modal | Cashier |
| Scan loyalty | Scan or enter loyalty card number | Cashier |
| Change unit | Change unit of measure for selected line | Cashier |
| Issue loyalty | Manually credit loyalty points | Manager |
| Line comment | Free-text note attached to line | Cashier |
| Return line | Initiate return of selected item | Cashier |
| Gift cards | Apply / issue gift card | Cashier |
| Trans. options | Hold, suspend, merge transactions | Cashier |
| Voids | Void selected line or entire transaction | Sr. Cashier (line), Manager (full) |
| Tax overrides | Apply tax exemption or rate override | Manager |

**Right Tab Strip (vertical tabs)**:
- ACTIONS — default; shows action buttons above
- ORDERS — list of open/suspended orders
- DISCOUNTS — discount entry, promo code field
- PRODUCTS — full product browser with category filter

#### Pay Buttons (bottom right, always visible)

| Button | Color | Action |
|--------|-------|--------|
| PAY CASH | Green (`#22c55e` bg) | Open cash payment modal |
| PAY CARD | Blue (`#3b82f6` bg) | Open card payment modal |

#### Payment Modal

Fields and logic per tender type:

**Cash**:
- Amount input (defaults to AMOUNT DUE)
- CHANGE DUE = entered amount - AMOUNT DUE (shown in large text, green)
- [CONFIRM PAYMENT] → opens drawer, completes transaction
- [CANCEL]

**Card (Credit / Debit / EMV / Contactless)**:
- Amount input (defaults to AMOUNT DUE)
- Terminal status indicator: Idle / Processing / Approved / Declined
- Auth flow: request sent to terminal → 60s timeout → auth_code returned
- On partial auth: remaining balance stays in AMOUNT DUE
- On decline: show retry / cancel modal
- On timeout: show retry / cancel modal; no double-charge protection via idempotency key

**Gift Card**:
- Card number input (scan or manual)
- [Lookup Balance] → shows current balance
- Amount to apply (defaults to min(balance, AMOUNT_DUE))
- If balance < AMOUNT_DUE: applies partial, remainder stays in AMOUNT_DUE

**Store Credit**:
- Requires customer assigned to transaction
- Shows available store credit balance
- Amount to apply input
- Same partial logic as gift card

**Split Tender**:
- Shows running list of applied tenders
- Each new tender reduces AMOUNT_DUE
- Final tender must zero balance to finalize

---

### 4.3 Transaction / Cart State Machine

**Transaction lifecycle states**:

```
[OPEN] → [TENDERED] → [COMPLETE]
  |                         |
  ├→ [SUSPENDED]            └→ [RETURNED]
  |
  └→ [VOIDED]
```

| State | Description | Allowed Transitions |
|-------|-------------|---------------------|
| OPEN | Cart being built | TENDERED, SUSPENDED, VOIDED |
| TENDERED | Payment in progress | COMPLETE, OPEN (cancel payment) |
| COMPLETE | Finalized; receipt issued | RETURNED |
| SUSPENDED | Held for later retrieval | OPEN (on resume) |
| VOIDED | Cancelled before completion | — (terminal state) |
| RETURNED | Post-completion reversal | — (terminal state) |

**Line item logic**:
- Each scan: lookup by barcode or SKU → returns item record (name, price, tax_class, available_qty)
- Duplicate scan: increment qty on existing matching SKU row; do not create new row
- Manual qty entry via numpad: validate `requested_qty <= available_qty`; if not, show: "Only [N] units available. Allow oversell?" (Manager required to confirm)
- Price edit: Manager role only; price_override_amount + manager_id + reason logged to `ManagerOverride`
- Discount edit: see permission thresholds in Section 4.8
- Line void: removes line, releases reserved inventory immediately, logs to `AuditEvent`

**Cart totals — calculation order** (must be implemented in this exact sequence):

```
1. LINE_TOTAL[n]     = unit_price[n] × qty[n]
2. LINE_NET[n]       = LINE_TOTAL[n] - line_discount_amt[n]
3. SUBTOTAL          = SUM(LINE_NET[n])
4. TXN_DISCOUNT      = transaction-level discount amount
5. SUBTOTAL_NET      = SUBTOTAL - TXN_DISCOUNT
6. TAX[n]            = LINE_NET[n] × tax_rate[n]   (per-line, per tax class)
7. TAX_TOTAL         = SUM(TAX[n])
8. TOTAL             = SUBTOTAL_NET + TAX_TOTAL
9. AMOUNT_DUE        = TOTAL - SUM(payments_applied)
```

Tax-inclusive pricing (where applicable): `net_price = inclusive_price / (1 + tax_rate)`, `tax = inclusive_price - net_price`.

**Hold / Suspend logic**:
- Suspend: serialize cart to `Transaction.status = SUSPENDED`; clear register display
- Resume: fetch by TXN ID or customer name from ORDERS tab
- Suspended transactions expire after 24 hours (configurable in system parameters)
- Suspended transactions visible to Manager across all cashiers; cashier sees own only

---

### 4.4 Inventory Impact

#### On item added to cart (not yet finalized)

```
reserved_qty += requested_qty
available_qty -= requested_qty
```

Oversell check: if `available_qty < 0` after decrement → show warning modal. Response options:
- Cancel (revert)
- Override (Manager PIN required if `allow_negative_inventory = false` in store config)

#### On transaction COMPLETE

```
committed_qty += qty
reserved_qty  -= qty
on_hand_qty   -= qty
```

Inventory movement event written to `InventoryMovement`:
- `txn_id`, `sku`, `qty`, `movement_type = SALE`, `store_id`, `timestamp`, `cashier_id`

#### On VOID (before COMPLETE)

```
reserved_qty -= qty   (release reservation)
available_qty += qty
```

No change to `on_hand_qty`. Movement event: `movement_type = VOID_RESERVATION`.

#### On RETURN (after COMPLETE)

```
on_hand_qty += qty   (if not damaged)
```

If `damaged = true`: no restock; write-off logged separately.
Movement event: `movement_type = RETURN`, `return_reason`, `damaged_flag`.

---

### 4.5 Tender / Payment Logic

#### Cash

- Accepted in all states including offline
- `change_due = tendered_amount - amount_due` (rounded to nearest $0.01)
- Change is always dispensed as cash regardless of other tenders in split
- On finalize: signals drawer open via `DrawerEvent.OPEN_SALE`
- Logged: `cash_in`, `change_out` on `RegisterShift`

#### Card (Credit / Debit / EMV / Contactless)

- Integration point: payment terminal API (current: mock; future: Stripe Terminal / Heartland)
- Auth flow: `POST /api/pos/payment/card/authorize` → terminal processes → returns `auth_code`
- Idempotency key: `txn_id + line_sequence` prevents double-charge on retry
- Partial auth: if terminal returns `authorized_amount < requested_amount`, difference remains in AMOUNT_DUE
- Timeout: 60 seconds → retry modal; cashier can retry or cancel
- Failure / decline: `PaymentStatus.DECLINED`, show retry / alternate tender modal
- No change dispensed on card

#### Gift Card

- Lookup: `GET /api/pos/gift-card/[number]` → returns `{ balance, status, expires_at }`
- Apply: `POST /api/pos/gift-card/redeem` → deducts from balance
- If `balance < amount_due`: partial apply, remainder in AMOUNT_DUE, split continues
- Settlement: gift card liability GL account decremented on finalize

#### Store Credit

- Requires `customerId` assigned to transaction
- `GET /api/pos/customer/[id]/store-credit` → returns available balance
- Same partial logic as gift card
- Deducted from `Customer.storeCredit` on finalize

#### Split Tender

- Multiple tenders applied in sequence, each reduces AMOUNT_DUE
- Running total visible in Payments tab
- Transaction cannot finalize until AMOUNT_DUE = 0.00
- Last tender must cover remaining balance exactly (or overpay with change if cash)

#### Offline Mode

| Tender Type | Offline Behavior |
|-------------|-----------------|
| Cash | Always works; no network needed |
| Card | Encrypt card data locally (AES-256); queue auth request; sync on reconnect; Manager PIN to accept offline card |
| Gift Card | Decline by default; Manager can override (risk acceptance logged) |
| Store Credit | Decline by default; Manager can override |

Offline sync queue: stored in `IndexedDB` on device; `POST /api/pos/sync/offline-queue` on reconnect.

---

### 4.6 Tax Logic

#### Tax Calculation

Each item has a `TAX_CLASS` (e.g., `TAXABLE`, `NON_TAXABLE`, `FOOD`, `DIGITAL`, `MEDICAL`).
Each store has a `TAX_JURISDICTION` (ZIP code + state → rate lookup from `TaxRate` table).

```
effective_rate = TaxRate WHERE tax_class = item.tax_class AND jurisdiction = store.jurisdiction
tax_per_line   = LINE_NET × effective_rate
```

Tax calculated on `LINE_NET` (after line discount is applied). Transaction-level discounts reduce taxable base proportionally across lines.

**Tax-exclusive (default)**: `tax = net_price × rate`. Total = net + tax.
**Tax-inclusive**: `net = inclusive_price / (1 + rate)`. Tax = `inclusive_price - net`. Configurable per store.

#### Tax Exemption

1. Customer must have `tax_exempt = true` + `tax_certificate_number` on `Customer` record
2. Cashier clicks "Tax Overrides" → system reads customer flag
3. Manager must confirm: enters PIN + confirms exemption is valid
4. All line taxes set to $0.00
5. Logged to `AuditEvent`: `certificate_number`, `manager_id`, `txn_id`, `timestamp`

#### Discount Before/After Tax

Configurable per store in system parameters (`tax_on_net` flag):
- `tax_on_net = true` (default): discount reduces taxable base before tax applied
- `tax_on_net = false`: tax calculated on gross, discount applied after tax

---

### 4.7 Discount / Promotion Logic

#### Discount Types

| Type | Scope | Applies To |
|------|-------|-----------|
| Line % discount | Single line | Unit price of selected item |
| Line $ discount | Single line | Fixed reduction on line total |
| Transaction % discount | Entire cart | Subtotal after line discounts |
| Transaction $ discount | Entire cart | Fixed reduction on subtotal |
| Coupon code | Cart or line | Lookup by code, applies rule |
| Automatic promo | Cart (engine-driven) | Applied on cart evaluation |

#### Role-Based Discount Thresholds

| Discount Level | Cashier | Senior Cashier | Manager |
|----------------|---------|----------------|---------|
| 0–10% | Allowed | Allowed | Allowed |
| 10–25% | Blocked | Allowed | Allowed |
| 25%+ | Blocked | Blocked | Manager PIN required |
| Price override | Blocked | Blocked | Manager PIN required |

#### Promo Engine Rules

Rules evaluated on every cart change. Rules checked in priority order; first match wins unless `stackable = true`.

| Rule Type | Logic |
|-----------|-------|
| BOGO | Buy item A (qty >= N), get item B at price override (free or % off) |
| QTY_THRESHOLD | Cart qty of matching SKUs >= threshold → % or $ off cart |
| CATEGORY_COMBO | Items from category A + category B in same cart → discount |
| LOYALTY_TIER | Customer tier (Gold, Platinum) → additional multiplier on everything |
| CLEARANCE_LOCK | Items tagged CLEARANCE → non-discountable regardless of other rules |
| NON_STACKABLE | Only best qualifying promo applies; evaluated by `savings_amount` |

Auto-applied promos do not require cashier action. Line shows promo name in `promoId` field.

#### Coupon Logic

| Field | Rule |
|-------|------|
| `single_use` | Validates against `PromotionUsage`; rejects if already used by customer |
| `expiry_date` | Reject if `now() > expiry_date` |
| `customer_specific` | Must match `transaction.customerId` if set |
| `min_purchase` | Reject if `subtotal < min_purchase` |
| `exclude_sale_items` | Coupon does not apply to items with `on_sale = true` |
| `max_uses` | Global usage count; reject if `used_count >= max_uses` |

On coupon apply: `PromotionUsage` record created; `Promotion.usedCount` incremented on finalize.

---

### 4.8 Role / Override Matrix

| Action | Cashier | Sr. Cashier | Manager | Admin |
|--------|:-------:|:-----------:|:-------:|:-----:|
| Add item to cart | Yes | Yes | Yes | Yes |
| Remove line (void line) | Yes | Yes | Yes | Yes |
| Void entire transaction | No | Yes | Yes | Yes |
| Discount 0–10% | Yes | Yes | Yes | Yes |
| Discount 10–25% | No | Yes | Yes | Yes |
| Discount 25%+ | No | No | Yes (PIN) | Yes |
| Price override | No | No | Yes (PIN) | Yes |
| Tax override / exemption | No | No | Yes (PIN) | Yes |
| Open cash drawer (sale) | Yes | Yes | Yes | Yes |
| Open cash drawer (no-sale) | No | Yes | Yes | Yes |
| Reprint receipt | Yes | Yes | Yes | Yes |
| Return with receipt | Yes | Yes | Yes | Yes |
| Return without receipt | No | No | Yes (PIN) | Yes |
| Suspend transaction | Yes | Yes | Yes | Yes |
| Resume any cashier's txn | No | No | Yes | Yes |
| See item cost price | No | No | Yes | Yes |
| See item margin % | No | No | Yes | Yes |
| Accept offline card | No | No | Yes (PIN) | Yes |
| Oversell approval | No | No | Yes (PIN) | Yes |
| Exceed customer credit limit | No | No | Yes (PIN) | Yes |
| Safe drop | No | Yes | Yes | Yes |
| Paid in / paid out | No | Yes | Yes | Yes |

#### Manager Override Flow

1. Action requires elevated permission
2. System displays: "Manager Approval Required" modal (blocks all other input)
3. Manager enters 4–6 digit PIN (or swipes Manager card on HID reader)
4. System validates: `user.role IN ('MANAGER', 'ADMIN')` + active session
5. If valid: override reason code selected from dropdown (required)
6. Override logged to `ManagerOverride`: `action_type`, `manager_id`, `cashier_id`, `txn_id`, `reason_code`, `timestamp`
7. Action proceeds with manager context attached

---

### 4.9 Register / Drawer / Shift Logic

#### Register Open

1. Cashier selects register from dropdown (REG-001, REG-002, etc.) — must be `status = CLOSED`
2. Inputs opening cash: denomination breakdown optional, total required
3. System records to `RegisterShift`: `register_id`, `cashier_id`, `opening_amount`, `opened_at`
4. Session ID generated, bound to device
5. `Register.status` → `OPEN`
6. `Register.currentShiftId` → new shift ID

#### During Shift — Drawer Events

| Event | Who | Requires | Logged As |
|-------|-----|----------|----------|
| Sale open | Auto on cash sale | — | `OPEN_SALE` |
| No-sale open | Cashier | Reason code (Sr. Cashier minimum) | `OPEN_NO_SALE` |
| Safe drop | Manager | Amount + reason | `SAFE_DROP` |
| Paid in | Sr. Cashier+ | Amount + reason | `PAID_IN` |
| Paid out | Sr. Cashier+ | Amount + reason | `PAID_OUT` |

`expected_cash = opening_amount + SUM(cash_sales) - SUM(change_given) + SUM(paid_in) - SUM(paid_out) - SUM(safe_drops)`

#### Register Close — Blind Close

1. Cashier clicks Close Register
2. System does NOT show expected cash
3. Cashier enters counted cash total (denomination breakdown optional)
4. System stores `counted_amount`, calculates `over_short = counted - expected` internally
5. Manager reviews over/short in back-office `RegisterShift` record

#### Register Close — Counted Close

Same as blind close but `expected_amount` shown to cashier during count. Configurable per store.

#### Over/Short Thresholds

| Range | Action |
|-------|--------|
| ±$0.00–$5.00 | Auto-approve; logged |
| $5.01–$20.00 | Requires manager acknowledgment before close |
| $20.01+ | Triggers `AUDIT_ALERT`; investigation workflow opened |

#### Z-Report (generated on close, register goes CLOSED)

- Total cash sales
- Total card sales (by card type)
- Total gift card sales
- Total returns by tender type
- Discounts total
- Coupons applied
- Tax collected (by tax class)
- Opening cash
- Closing counted cash
- Over / short amount
- Transaction count
- Average transaction value

#### X-Report (mid-shift, non-closing snapshot)

Same data as Z-report. Register stays OPEN. Can be printed any time by Sr. Cashier+.

---

### 4.10 Customer / Loyalty / CRM Logic

#### Customer Assignment

| Method | API Call |
|--------|---------|
| Phone number search | `GET /api/pos/customer/lookup?phone=` |
| Email search | `GET /api/pos/customer/lookup?email=` |
| Loyalty card scan | `GET /api/pos/loyalty/card/[number]` |
| Name fuzzy search | `GET /api/pos/customer/lookup?name=` |

On assign: customer record attached to `Transaction.customerId`. Header displays: name, loyalty tier badge, point balance, store credit balance. Tax exempt flag shows "TAX EXEMPT" banner in transaction header.

#### Customer on Transaction

| Field Shown | Source |
|-------------|--------|
| Name | `Customer.firstName + lastName` |
| Loyalty tier | `LoyaltyMember.tier` (Bronze / Silver / Gold / Platinum) |
| Point balance | `LoyaltyMember.points` |
| Store credit | `Customer.storeCredit` |
| Tax exempt | `Customer.taxExempt` (shows banner if true) |
| Special price list | `Customer.priceListId` (auto-applies tier pricing) |
| Account receivable | `Customer.houseAccount` (enables "Charge to Account" tender) |

#### Loyalty Points

| Rule | Value |
|------|-------|
| Earn rate | 1 point per $1 spent (configurable in `LoyaltyProgram` config) |
| Gold tier bonus | 2× points on all purchases |
| Platinum tier bonus | 3× points |
| Redemption rate | 100 points = $1 store credit |
| Minimum redeem | 500 points |
| Points awarded | On `Transaction.status = COMPLETE` only; not during cart build |
| Return reversal | Points reversed proportionally on return |
| Blackout items | SKUs tagged `loyalty_excluded = true` do not earn points |

Tier thresholds (lifetime points):
- Bronze: 0–999 lifetime points
- Silver: 1,000–4,999
- Gold: 5,000–14,999
- Platinum: 15,000+

#### Loyalty Enrollment at POS

1. Cashier clicks "Scan Loyalty" on right action panel
2. Customer provides phone or email
3. If record found: assign to transaction
4. If no record: "Enroll?" modal
5. Enrollment fields: first name, last name, phone, email, opt-in to marketing (checkbox)
6. Card generated: UUID-based card number stored in `LoyaltyMember.cardNumber`
7. Card delivered: SMS (if phone provided) or email (if provided); physical card issued later

---

### 4.11 Backend / API / Database Blueprint

#### Prisma Schema Additions (append to `prisma/schema.prisma`)

```prisma
enum TxnStatus {
  OPEN
  TENDERED
  COMPLETE
  SUSPENDED
  VOIDED
  RETURNED
}

enum TenderType {
  CASH
  CARD
  GIFT_CARD
  STORE_CREDIT
  HOUSE_ACCOUNT
}

enum PaymentStatus {
  PENDING
  AUTHORIZED
  CAPTURED
  DECLINED
  REFUNDED
  OFFLINE_QUEUED
}

enum RegisterStatus {
  CLOSED
  OPEN
  SUSPENDED
}

enum ShiftStatus {
  OPEN
  CLOSED
}

enum DrawerEventType {
  OPEN_SALE
  OPEN_NO_SALE
  PAID_IN
  PAID_OUT
  SAFE_DROP
}

enum GiftCardStatus {
  ACTIVE
  DEPLETED
  FROZEN
  EXPIRED
}

enum LoyaltyTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
}

enum PromoType {
  PERCENT_OFF
  FIXED_OFF
  BOGO
  QTY_THRESHOLD
  CATEGORY_COMBO
}

enum MovementType {
  SALE
  RETURN
  TRANSFER_OUT
  TRANSFER_IN
  ADJUSTMENT
  CYCLE_COUNT
  VOID_RESERVATION
  RECEIVING
}

model Transaction {
  id            String              @id @default(cuid())
  txnNumber     String              @unique // TXN-20260422-0001
  registerId    String
  storeId       String
  cashierId     String
  shiftId       String
  customerId    String?
  status        TxnStatus           @default(OPEN)
  subtotal      Decimal             @db.Decimal(12,2)
  discountTotal Decimal             @default(0) @db.Decimal(12,2)
  taxTotal      Decimal             @db.Decimal(12,2)
  total         Decimal             @db.Decimal(12,2)
  paidTotal     Decimal             @default(0) @db.Decimal(12,2)
  changeDue     Decimal             @default(0) @db.Decimal(12,2)
  notes         String?
  idempotencyKey String?            @unique
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
  completedAt   DateTime?
  lines         TransactionLine[]
  payments      TransactionPayment[]
  events        TransactionEvent[]
  overrides     ManagerOverride[]
}

model TransactionLine {
  id              String      @id @default(cuid())
  transactionId   String
  itemId          String
  sku             String
  description     String
  qty             Decimal     @db.Decimal(10,3)
  unitPrice       Decimal     @db.Decimal(12,2)
  discountPct     Decimal     @default(0) @db.Decimal(5,4)
  discountAmt     Decimal     @default(0) @db.Decimal(12,2)
  netPrice        Decimal     @db.Decimal(12,2)
  taxClass        String
  taxRate         Decimal     @db.Decimal(5,4)
  taxAmt          Decimal     @db.Decimal(12,2)
  extTotal        Decimal     @db.Decimal(12,2)
  costPrice       Decimal     @db.Decimal(12,2)
  promoId         String?
  lineComment     String?
  voidedAt        DateTime?
  voidedBy        String?
  loyaltyExcluded Boolean     @default(false)
  createdAt       DateTime    @default(now())
  transaction     Transaction @relation(fields: [transactionId], references: [id])
}

model TransactionPayment {
  id              String        @id @default(cuid())
  transactionId   String
  tenderType      TenderType
  amount          Decimal       @db.Decimal(12,2)
  authCode        String?
  cardLast4       String?
  cardNetwork     String?       // VISA, MC, AMEX, DISC
  giftCardId      String?
  changeDue       Decimal       @default(0) @db.Decimal(12,2)
  status          PaymentStatus @default(PENDING)
  terminalId      String?
  offlineToken    String?       // encrypted card data for offline queue
  processedAt     DateTime?
  createdAt       DateTime      @default(now())
  transaction     Transaction   @relation(fields: [transactionId], references: [id])
}

model TransactionEvent {
  id            String      @id @default(cuid())
  transactionId String
  eventType     String      // STATE_CHANGE, LINE_ADD, LINE_VOID, PAYMENT, OVERRIDE
  payload       Json
  actorId       String
  createdAt     DateTime    @default(now())
  transaction   Transaction @relation(fields: [transactionId], references: [id])
}

model ManagerOverride {
  id            String      @id @default(cuid())
  transactionId String?
  actionType    String      // DISCOUNT_OVERRIDE, PRICE_OVERRIDE, TAX_EXEMPT, VOID, RETURN_NO_RECEIPT, OVERSELL
  managerId     String
  cashierId     String
  reasonCode    String
  notes         String?
  approvedAt    DateTime    @default(now())
  transaction   Transaction? @relation(fields: [transactionId], references: [id])
}

model Register {
  id              String          @id @default(cuid())
  storeId         String
  name            String          // REG-001
  deviceId        String?
  status          RegisterStatus  @default(CLOSED)
  currentShiftId  String?
  ipAddress       String?
  createdAt       DateTime        @default(now())
  shifts          RegisterShift[]
}

model RegisterShift {
  id              String      @id @default(cuid())
  registerId      String
  cashierId       String
  openedAt        DateTime    @default(now())
  closedAt        DateTime?
  openingAmount   Decimal     @db.Decimal(12,2)
  countedAmount   Decimal?    @db.Decimal(12,2)
  expectedAmount  Decimal?    @db.Decimal(12,2)
  overShort       Decimal?    @db.Decimal(12,2)
  status          ShiftStatus @default(OPEN)
  xReportCount    Int         @default(0)
  register        Register    @relation(fields: [registerId], references: [id])
  drawerEvents    DrawerEvent[]
}

model DrawerEvent {
  id              String          @id @default(cuid())
  shiftId         String
  registerId      String
  eventType       DrawerEventType
  amount          Decimal         @default(0) @db.Decimal(12,2)
  reason          String?
  authorizedBy    String?
  transactionId   String?         // links to sale if OPEN_SALE
  createdAt       DateTime        @default(now())
  shift           RegisterShift   @relation(fields: [shiftId], references: [id])
}

model GiftCard {
  id              String          @id @default(cuid())
  cardNumber      String          @unique
  balance         Decimal         @db.Decimal(12,2)
  originalBalance Decimal         @db.Decimal(12,2)
  status          GiftCardStatus  @default(ACTIVE)
  issuedAt        DateTime        @default(now())
  issuedByStore   String
  issuedByTxnId   String?
  expiresAt       DateTime?
  transactions    GiftCardTransaction[]
}

model GiftCardTransaction {
  id          String    @id @default(cuid())
  giftCardId  String
  txnId       String
  amount      Decimal   @db.Decimal(12,2)
  type        String    // ISSUE, REDEEM, RELOAD, VOID
  balanceAfter Decimal  @db.Decimal(12,2)
  createdAt   DateTime  @default(now())
  giftCard    GiftCard  @relation(fields: [giftCardId], references: [id])
}

model LoyaltyMember {
  id              String        @id @default(cuid())
  customerId      String        @unique
  cardNumber      String        @unique
  tier            LoyaltyTier   @default(BRONZE)
  points          Int           @default(0)
  lifetimePoints  Int           @default(0)
  enrolledAt      DateTime      @default(now())
  enrolledByStore String?
  events          LoyaltyEvent[]
}

model LoyaltyEvent {
  id          String        @id @default(cuid())
  memberId    String
  txnId       String?
  eventType   String        // EARN, REDEEM, EXPIRE, MANUAL_ADJUST
  points      Int           // positive = earn, negative = redeem/expire
  balanceAfter Int
  notes       String?
  createdAt   DateTime      @default(now())
  member      LoyaltyMember @relation(fields: [memberId], references: [id])
}

model Promotion {
  id              String      @id @default(cuid())
  name            String
  type            PromoType
  value           Decimal     @db.Decimal(10,4)
  minPurchase     Decimal     @default(0) @db.Decimal(12,2)
  startDate       DateTime
  endDate         DateTime
  storeIds        String      // JSON array of store IDs
  channelIds      String      // JSON array (POS, ECOM, MOBILE)
  itemInclusions  String      // JSON array of SKUs (empty = all items)
  itemExclusions  String      // JSON array of SKUs
  categoryIds     String      // JSON array of category IDs
  isStackable     Boolean     @default(false)
  couponCode      String?     @unique
  maxUses         Int?
  usedCount       Int         @default(0)
  isActive        Boolean     @default(true)
  createdAt       DateTime    @default(now())
  usages          PromotionUsage[]
}

model PromotionUsage {
  id          String    @id @default(cuid())
  promotionId String
  txnId       String
  customerId  String?
  usedAt      DateTime  @default(now())
  promotion   Promotion @relation(fields: [promotionId], references: [id])
}

model TaxJurisdiction {
  id          String    @id @default(cuid())
  state       String
  county      String?
  city        String?
  zipCode     String?
  rates       TaxRate[]
}

model TaxRate {
  id              String          @id @default(cuid())
  jurisdictionId  String
  taxClass        String          // TAXABLE, FOOD, DIGITAL, MEDICAL, NON_TAXABLE
  rate            Decimal         @db.Decimal(6,4)  // e.g., 0.0825 for 8.25%
  effectiveFrom   DateTime
  effectiveTo     DateTime?
  jurisdiction    TaxJurisdiction @relation(fields: [jurisdictionId], references: [id])
}

model InventoryMovement {
  id            String        @id @default(cuid())
  itemId        String
  sku           String
  storeId       String
  warehouseId   String?
  movementType  MovementType
  qtyChange     Decimal       @db.Decimal(10,3)   // negative for outbound
  qtyAfter      Decimal       @db.Decimal(10,3)
  referenceId   String?       // txn_id, transfer_id, count_id, etc.
  actorId       String
  notes         String?
  createdAt     DateTime      @default(now())
}

model TransferOrder {
  id              String          @id @default(cuid())
  transferNumber  String          @unique
  fromStoreId     String
  toStoreId       String
  status          String          // DRAFT, IN_TRANSIT, RECEIVED, CANCELLED
  requestedBy     String
  shippedAt       DateTime?
  receivedAt      DateTime?
  notes           String?
  createdAt       DateTime        @default(now())
  lines           TransferLine[]
}

model TransferLine {
  id              String        @id @default(cuid())
  transferId      String
  itemId          String
  sku             String
  qtyRequested    Decimal       @db.Decimal(10,3)
  qtyShipped      Decimal?      @db.Decimal(10,3)
  qtyReceived     Decimal?      @db.Decimal(10,3)
  discrepancyNote String?
  transfer        TransferOrder @relation(fields: [transferId], references: [id])
}

model CycleCount {
  id              String            @id @default(cuid())
  countNumber     String            @unique
  storeId         String
  warehouseId     String?
  zone            String?
  category        String?
  status          String            // OPEN, IN_PROGRESS, POSTED, CANCELLED
  startedBy       String
  postedBy        String?
  startedAt       DateTime          @default(now())
  postedAt        DateTime?
  lines           CycleCountLine[]
}

model CycleCountLine {
  id              String      @id @default(cuid())
  countId         String
  itemId          String
  sku             String
  systemQty       Decimal     @db.Decimal(10,3)
  countedQty      Decimal?    @db.Decimal(10,3)
  variance        Decimal?    @db.Decimal(10,3)
  counted         Boolean     @default(false)
  countedBy       String?
  countedAt       DateTime?
  count           CycleCount  @relation(fields: [countId], references: [id])
}

model ReceiptLog {
  id            String    @id @default(cuid())
  txnId         String
  method        String    // PRINT, EMAIL, SMS, NONE
  recipient     String?   // email address or phone number
  printedAt     DateTime?
  sentAt        DateTime?
  status        String    // SENT, FAILED, PRINTED
  createdAt     DateTime  @default(now())
}

model AuditEvent {
  id          String    @id @default(cuid())
  module      String    // POS, INVENTORY, FINANCE, HR, etc.
  action      String    // CREATE, UPDATE, DELETE, OVERRIDE, LOGIN, etc.
  entityType  String    // Transaction, Item, Customer, etc.
  entityId    String?
  actorId     String
  actorRole   String
  ipAddress   String?
  payload     Json?     // before/after snapshot for sensitive changes
  createdAt   DateTime  @default(now())
}
```

#### Required API Routes

| Method | Route | Purpose | Min Role |
|--------|-------|---------|----------|
| POST | `/api/pos/transaction/create` | Create new transaction | Cashier |
| GET | `/api/pos/transaction/[id]` | Load transaction state | Cashier |
| POST | `/api/pos/transaction/[id]/add-line` | Add item to cart | Cashier |
| PATCH | `/api/pos/transaction/[id]/line/[lineId]` | Update qty / discount | Cashier |
| DELETE | `/api/pos/transaction/[id]/line/[lineId]` | Void line | Sr. Cashier |
| POST | `/api/pos/transaction/[id]/apply-promo` | Apply coupon or promo code | Cashier |
| POST | `/api/pos/transaction/[id]/assign-customer` | Link customer to transaction | Cashier |
| POST | `/api/pos/transaction/[id]/payment` | Add tender to payment stack | Cashier |
| POST | `/api/pos/transaction/[id]/finalize` | Complete transaction | Cashier |
| POST | `/api/pos/transaction/[id]/void` | Void entire transaction | Sr. Cashier |
| POST | `/api/pos/transaction/[id]/suspend` | Suspend (hold) transaction | Cashier |
| GET | `/api/pos/transactions/suspended` | List held transactions | Cashier |
| POST | `/api/pos/transaction/return` | Process return | Cashier / Manager |
| GET | `/api/pos/products/lookup` | Barcode / SKU / name search | Cashier |
| GET | `/api/pos/customer/lookup` | Phone / email / name search | Cashier |
| GET | `/api/pos/customer/[id]/store-credit` | Fetch store credit balance | Cashier |
| POST | `/api/pos/register/open` | Open register, create shift | Cashier |
| POST | `/api/pos/register/close` | Close register, generate Z | Cashier |
| POST | `/api/pos/register/drawer-event` | Log drawer event | Sr. Cashier |
| GET | `/api/pos/register/[id]/shift` | Get current shift data | Cashier |
| GET | `/api/pos/register/[id]/x-report` | Generate X-report | Sr. Cashier |
| GET | `/api/pos/gift-card/[number]` | Lookup gift card balance | Cashier |
| POST | `/api/pos/gift-card/redeem` | Deduct from gift card | Cashier |
| POST | `/api/pos/gift-card/issue` | Issue new gift card | Cashier |
| POST | `/api/pos/loyalty/earn` | Award points post-sale | System |
| POST | `/api/pos/loyalty/redeem` | Redeem points for credit | Cashier |
| GET | `/api/pos/loyalty/card/[number]` | Lookup by loyalty card | Cashier |
| POST | `/api/pos/loyalty/enroll` | Enroll new loyalty member | Cashier |
| POST | `/api/pos/override/request` | Log override request | Cashier |
| POST | `/api/pos/override/approve` | Approve with manager PIN | Manager |
| GET | `/api/pos/tax/calculate` | Calculate tax for cart state | System |
| GET | `/api/pos/promotions/evaluate` | Evaluate cart against promo engine | System |
| POST | `/api/pos/sync/offline-queue` | Process offline auth queue | System |
| POST | `/api/pos/receipt/send` | Email or SMS receipt | Cashier |

All routes:
- Accept `Content-Type: application/json`
- Return `{ success: boolean, data?: T, error?: string, code?: string }`
- Protected by role middleware: `withRole(['CASHIER', 'SR_CASHIER', 'MANAGER', 'ADMIN'])`
- Log to `AuditEvent` on any mutation

---

## 5. Critical Pages Still Pending — Build Specifications

### 5.1 `/pos/register-management`

**Purpose**: Open / close registers, manage shifts, Z-reports, cash counting.

**Layout**:
```
TopBar: "Register Management" | breadcrumb: POS > Register Management | [Open Register] [X Report] [Z Report]

Main grid (2-col):
  Left (register list):
    - Register card per device: name, status chip (Open/Closed), current cashier, shift start time
    - Click to select active register

  Right (shift summary):
    - Shift ID, cashier name, opened at
    - Running totals: cash sales, card sales, gift card sales, returns, discounts, tax
    - Drawer events log: timestamped list (paid in, paid out, no-sale)
    - [Safe Drop] [Paid In] [Paid Out] [No Sale] buttons
```

**Open Register Modal**:
- Register selector (if not pre-selected)
- Opening cash total (required, numeric)
- Denomination breakdown (optional toggle): Pennies / Nickels / Dimes / Quarters / $1 / $5 / $10 / $20 / $50 / $100
- [Open Register] button → `POST /api/pos/register/open`

**Close Register Modal (Blind)**:
- Instruction text: "Count your drawer and enter the total below."
- Counted cash total (required)
- Denomination breakdown (optional)
- [Submit Count] button → system calculates over/short, shows result only to Manager
- Confirmation: "Shift closed. Z-Report generated."

**Close Register Modal (Counted)**:
- Same as blind + shows expected amount during count entry

**Z-Report Display**:
- Full-screen modal or new browser tab
- Printable layout (`@media print` CSS)
- Sections: Sales Summary | Returns | Discounts | Tax | Tender Totals | Cash Reconciliation
- [Print] [Email to Manager] [Close]

### 5.2 `/pos/returns`

**Purpose**: Process merchandise returns at POS register.

**Layout**:
```
TopBar: "Process Return" | breadcrumb: POS > Returns | [New Return]

Search panel:
  - TXN number input (scan receipt barcode or type)
  - Customer phone/email lookup
  - [No Receipt Return] button (Manager required)

Results panel (original transaction found):
  - TXN summary: date, cashier, total, original tender type
  - Line items list: checkbox per item, qty selector (1 to original qty)
  - Return reason dropdown (required): Customer Changed Mind / Defective / Wrong Item / Other
  - Refund method selector: Original Tender / Store Credit / Exchange
  - Damaged item flag: checkbox per line (prevents restock)

Footer totals:
  - Items to return, return subtotal, return tax, refund amount

[Process Return] button → POST /api/pos/transaction/return
```

**Return without receipt flow**:
1. Manager PIN required to proceed
2. Customer lookup: must have purchase history or manager confirms manually
3. Refund method locked to Store Credit only
4. Manager enters reason code
5. Logged to `ManagerOverride`

**Tax recalculation**: return tax = original tax rate × net return amount per line.

**Inventory restock**: `InventoryMovement.RETURN` written for each non-damaged item.

### 5.3 `/inventory/transfers`

**Purpose**: Move inventory between stores or warehouse locations.

**Layout**:
```
TopBar: "Transfer Orders" | [New Transfer]

Filter bar: Status (All/Draft/In Transit/Received/Cancelled) | From | To | Date range

Table: Transfer # | From | To | Status | Items | Qty Total | Requested By | Shipped At | Received At | Actions

Detail page (/inventory/transfers/[id]):
  FastTab — Header: Transfer #, From Location, To Location, Status, Notes
  FastTab — Lines: Item, SKU, Requested Qty, Shipped Qty, Received Qty, Variance
  Actions bar: [Ship] [Receive] [Cancel] (role-gated)
```

**Ship action**: locks `qtyShipped`, writes `InventoryMovement.TRANSFER_OUT` at source, status → `IN_TRANSIT`.

**Receive action**: enter `qtyReceived` per line (can differ from shipped), writes `InventoryMovement.TRANSFER_IN` at destination, computes `variance = qtyShipped - qtyReceived`, status → `RECEIVED`.

**Discrepancy handling**: if `variance != 0`, Manager must acknowledge discrepancy with reason before receive can be posted.

### 5.4 `/inventory/cycle-count`

**Purpose**: Physical inventory count and reconciliation.

**Layout**:
```
TopBar: "Cycle Count" | [New Count Session]

Sessions list: Count #, Location, Zone/Category, Status, Started By, Started At, Variance Items

New Count modal:
  - Store / Warehouse selector
  - Scope: All Items / Category / Zone / Custom SKU List
  - [Generate Count Sheet]

Count Entry page (/inventory/cycle-count/[id]):
  - Item list: SKU | Description | System Qty (hidden until posted) | Counted Qty input | Counted By
  - Scan mode: scan barcode → auto-focus count field for that SKU
  - [Mark All Counted] [Post Count]

Variance Report (post-count):
  - Table: SKU | Description | System Qty | Counted Qty | Variance | Variance $ Value
  - Flag: highlight lines where |variance| > threshold
  - [Post Adjustments] button → writes InventoryMovement.CYCLE_COUNT per variance line
```

System qty is hidden during count entry to prevent anchoring bias (blind count). Revealed on variance report.

### 5.5 `/crm/leads`

**Purpose**: CRM leads list page. The lead detail `/crm/leads/[id]` is built; this is the list.

**Layout**:
```
TopBar: "Leads" | [New Lead] [Import]

Filter bar:
  - Search (name, company, email)
  - Status: All | New | Contacted | Qualified | Proposal Sent | Won | Lost
  - Owner: dropdown (all users)
  - Source: dropdown (Web / Referral / Trade Show / Cold Call / Other)
  - Date range: created

Table (25 rows/page, sortable):
  Lead Name | Company | Source | Status chip | Owner | Created | Lead Score | Actions

Status chips:
  New = indigo | Contacted = blue | Qualified = green | Proposal Sent = yellow | Won = emerald | Lost = red/muted

Row click → /crm/leads/[id]
Actions column: [Edit] [Assign] [Delete]

Pagination: previous / page N of N / next
```

### 5.6 `/hr/workers`

**Purpose**: Employee master list with access to full employee detail.

**Layout**:
```
TopBar: "Workers" | [New Worker] [Import]

Filter bar:
  - Search (name, employee #, email)
  - Department: dropdown
  - Position: dropdown
  - Status: All | Active | On Leave | Terminated

Table (25 rows/page):
  Employee # | Name | Department | Position | Hire Date | Status chip | Manager | Actions

Status chips: Active = green | On Leave = yellow | Terminated = red/muted

Row click → /hr/workers/[id]
```

**Worker Detail Page** (`/hr/workers/[id]`):
```
Header: Employee photo placeholder, name, employee #, position, department, status chip
[Edit] [Terminate] [Transfer] buttons (Manager+)

FastTab — Employment:
  Hire date, employment type (Full-time/Part-time/Contract), legal entity, work location, manager

FastTab — Compensation:
  Pay type (Hourly/Salary), pay rate, pay frequency, last review date, next review date

FastTab — Benefits:
  Active enrollments: Health / Dental / Vision / 401k, effective dates, employee contribution

FastTab — Leave:
  Leave balances: PTO, Sick, Vacation — accrued, used, remaining
  Leave request history table

FastTab — Performance:
  Performance review list: date, reviewer, rating, comments, [View Full Review]

FastTab — Documents:
  W-4, I-9, Offer Letter, Performance Reviews — upload + download links
```

---

## 6. QA Master Test Matrix

### POS Transaction Tests

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| POS-001 | Scan valid barcode | Item added to cart, inventory reserved | P0 |
| POS-002 | Scan unknown barcode | "Item not found" error modal, no cart change | P0 |
| POS-003 | Scan same barcode twice | Qty increments on existing line, no new row | P0 |
| POS-004 | Qty > available stock | Warning modal: "Only N in stock. Continue?" | P0 |
| POS-005 | Cash payment exact amount | AMOUNT_DUE = 0, change = 0, drawer opens | P0 |
| POS-006 | Cash payment overpay | Change = overpaid amount, shown in large green text | P0 |
| POS-007 | Card payment success | Auth code stored, transaction completes | P0 |
| POS-008 | Card payment timeout (60s) | Retry modal shown, no double-charge (idempotency key) | P0 |
| POS-009 | Card payment decline | "Declined" modal, amount removed from payments, AMOUNT_DUE restored | P0 |
| POS-010 | Split tender cash + card | Both applied sequentially, running balance updates each time | P0 |
| POS-011 | 10% discount as cashier | Applies immediately, no override required | P1 |
| POS-012 | 30% discount as cashier | Blocked; manager override modal appears | P0 |
| POS-013 | Manager override discount | PIN entered, override logged to ManagerOverride, discount applied | P0 |
| POS-014 | Void single line | Line removed, inventory reservation released | P0 |
| POS-015 | Void entire transaction | All lines removed, inventory reservations released, status = VOIDED | P0 |
| POS-016 | Suspend transaction | Cart serialized to DB, register clears to new transaction | P1 |
| POS-017 | Resume suspended transaction | Cart restored exactly: same lines, same discounts, same customer | P1 |
| POS-018 | Tax-exempt customer assigned | Tax = $0 across all lines, certificate logged to AuditEvent | P1 |
| POS-019 | Loyalty points earned | Points credited on COMPLETE, not on cart build | P1 |
| POS-020 | Gift card insufficient balance | Partial amount applied, remaining stays in AMOUNT_DUE | P1 |
| POS-021 | Return with receipt | Original lines shown, original tender refunded | P0 |
| POS-022 | Return without receipt | Manager PIN required; store credit only | P0 |
| POS-023 | Offline card payment | Encrypted token stored locally; queued for sync on reconnect | P1 |
| POS-024 | Duplicate finalize (double-click) | Idempotency key: only one transaction created, second returns 409 | P0 |
| POS-025 | BOGO promo auto-applied | Qualifying item at $0 on add, promo name shown on line | P1 |
| POS-026 | Coupon expired | Reject with "Coupon expired" message, no discount applied | P1 |
| POS-027 | Coupon already used (single-use) | Reject with "Coupon already redeemed" message | P1 |
| POS-028 | Receipt via email | Email sent, ReceiptLog record created with status = SENT | P2 |
| POS-029 | Loyalty enrollment at POS | Member record created, card number generated, SMS/email sent | P2 |
| POS-030 | Price override by Manager | New price applied, ManagerOverride record created | P0 |

### Register / Shift Tests

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| REG-001 | Open register with $200 opening cash | RegisterShift created, status = OPEN, openingAmount = 200.00 |
| REG-002 | Blind close, exact count | overShort = 0.00, shift status = CLOSED |
| REG-003 | Blind close, $10 short | overShort = -10.00, alert generated for Manager review |
| REG-004 | Blind close, $25 over | overShort = +25.00, AUDIT_ALERT triggered, investigation workflow opened |
| REG-005 | No-sale drawer open | DrawerEvent.OPEN_NO_SALE logged, reason required, Sr. Cashier minimum |
| REG-006 | Safe drop $500 | DrawerEvent.SAFE_DROP logged, expected_cash reduced by 500 |
| REG-007 | Z-report generated | All shift totals match sum of transactions, register closes |
| REG-008 | X-report mid-shift | Report shows running totals, register stays OPEN |
| REG-009 | Open already-open register | Error: "Register already open by [cashier name]" |
| REG-010 | Close register with open transaction | Error: "Active transaction [TXN-ID] must be completed or voided first" |

### Inventory Tests

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| INV-001 | Sale completes | on_hand_qty decrements, InventoryMovement.SALE written |
| INV-002 | Transaction voided | reserved_qty released, on_hand_qty unchanged |
| INV-003 | Return non-damaged | on_hand_qty increments, InventoryMovement.RETURN written |
| INV-004 | Return damaged | on_hand_qty unchanged, damaged_flag logged |
| INV-005 | Transfer order ship | TRANSFER_OUT at source, qty locked |
| INV-006 | Transfer order receive | TRANSFER_IN at destination, variance calculated |
| INV-007 | Cycle count post | CYCLE_COUNT movement per variance line, system qty updated |

---

## 7. Development Build Order

### Phase 1 — POS Core (Weeks 1–2) — Highest Revenue Impact

Blocking issue: the POS terminal at `/pos/transaction` is built but all actions are mocked. Phase 1 wires real data.

1. Add Prisma schema models: `Transaction`, `TransactionLine`, `TransactionPayment`, `Register`, `RegisterShift`, `DrawerEvent`, `GiftCard`, `GiftCardTransaction`, `LoyaltyMember`, `LoyaltyEvent`, `ManagerOverride`, `AuditEvent`, `ReceiptLog`
2. Run `prisma migrate dev --name pos-core`
3. Build all API routes listed in Section 4.11 (39 routes)
4. Wire `/pos/transaction` page actions to real API (currently using local state only)
5. Build `/pos/register-management` (spec: Section 5.1)
6. Build `/pos/returns` (spec: Section 5.2)
7. Build `/pos/gift-cards` (gift card issuance, balance lookup, reload)
8. Add NextAuth session middleware with `CASHIER / SR_CASHIER / MANAGER / ADMIN` roles
9. Add role-gating middleware to all `/api/pos/` routes
10. Add idempotency key handling to `finalize` route

**Acceptance criteria for Phase 1**: A cashier can open a register, ring a sale, accept cash/card payment, issue a receipt, and close the register with a Z-report. All data persists to SQLite.

### Phase 2 — Inventory Core (Week 3)

11. Add Prisma models: `InventoryMovement`, `TransferOrder`, `TransferLine`, `CycleCount`, `CycleCountLine`
12. Run `prisma migrate dev --name inventory-core`
13. Build `/inventory/transfers` (spec: Section 5.3)
14. Build `/inventory/cycle-count` (spec: Section 5.4)
15. Build `/inventory/adjustments` (manual adj + reason codes)
16. Build `/inventory/items/[id]` (item detail: variants, stock levels, movement history, pricing)
17. Build `/procurement/receiving` (link PO to receiving doc, write RECEIVING movement)
18. Wire inventory decrement from POS finalize to `InventoryMovement`

### Phase 3 — Sales & CRM (Week 4)

19. Build `/sales/customers/[id]` — customer detail: account info, order history, loyalty, credit limit, addresses
20. Build `/crm/leads` — leads list page (spec: Section 5.5)
21. Build `/crm/contacts` — contacts list with FastTab detail panel
22. Build `/crm/opportunities` — pipeline view (Kanban or list, configurable)
23. Build `/sales/orders/[id]` — sales order detail: lines, status, fulfillment, invoicing
24. Build `/sales/returns` — sales order returns (not POS — warehouse/back-office returns)

### Phase 4 — Finance Core (Week 5)

25. Add Prisma models: `ChartOfAccount`, `GLEntry`, `AccountingPeriod`, `TaxJurisdiction`, `TaxRate`
26. Run `prisma migrate dev --name finance-core`
27. Build `/finance/chart-of-accounts` — GL account tree, add/edit accounts, account type, posting rules
28. Build `/finance/trial-balance` — TB report by period, drill-down to GL entries
29. Build `/finance/tax-management` — jurisdiction setup, rate table, effective date management
30. Wire tax calculation in POS to `TaxRate` table (replace hardcoded 8.25%)

### Phase 5 — HR, Loyalty & Promotions (Week 6)

31. Build `/hr/workers` + `/hr/workers/[id]` (spec: Section 5.6)
32. Build `/hr/performance` — performance review form, rating scales, reviewer assignment
33. Add Prisma models: `Promotion`, `PromotionUsage`
34. Build `/promotions/engine` — promotion rule builder UI
35. Build `/promotions/coupons` — coupon code management
36. Build `/loyalty/program` — tier configuration, earn/redeem rates
37. Wire promotions engine evaluation into `/api/pos/promotions/evaluate`

### Phase 6 — Reporting & Admin (Week 7)

38. Build `/pos/reports` — POS closeout reports, daily / weekly / monthly summaries
39. Build `/admin/security-roles` — role definition editor, permission matrix UI
40. Build `/hr/recruiting` — job requisitions, applicant tracking, status pipeline
41. Build `/retail/channel-management` — channel (POS / eCommerce / Mobile) configuration
42. Build `/ecommerce/orders` — inbound online order queue, fulfillment status

### Phase 7 — Manufacturing & Operations (Week 8)

43. Build `/manufacturing/bom` — bill of materials editor, component hierarchy, cost rollup
44. Build `/manufacturing/quality` — inspection checkpoints, pass/fail entry, NCR generation
45. Build `/projects/planning` — Gantt chart (pure SVG, no library; week/month/quarter views)
46. Build `/operations/maintenance` — asset register, maintenance schedule, work orders

---

## 8. Database / Prisma Schema Gaps

Models missing from current `prisma/schema.prisma` that must be added before any PENDING route can function:

| Model | Needed By | Phase |
|-------|-----------|-------|
| `Transaction` | POS transaction | 1 |
| `TransactionLine` | POS transaction | 1 |
| `TransactionPayment` | POS transaction | 1 |
| `TransactionEvent` | POS audit trail | 1 |
| `Register` | Register management | 1 |
| `RegisterShift` | Register management | 1 |
| `DrawerEvent` | Register management | 1 |
| `GiftCard` | Gift cards | 1 |
| `GiftCardTransaction` | Gift card redemption | 1 |
| `LoyaltyMember` | Loyalty | 1 |
| `LoyaltyEvent` | Loyalty earn/redeem | 1 |
| `ManagerOverride` | Role overrides | 1 |
| `AuditEvent` | Platform-wide audit | 1 |
| `ReceiptLog` | Receipt issuance | 1 |
| `InventoryMovement` | Inventory accuracy | 2 |
| `TransferOrder` + `TransferLine` | Transfers | 2 |
| `CycleCount` + `CycleCountLine` | Cycle count | 2 |
| `Promotion` + `PromotionUsage` | Promo engine | 5 |
| `TaxJurisdiction` + `TaxRate` | Tax accuracy | 4 |
| `ChartOfAccount` + `GLEntry` | Finance | 4 |
| `AccountingPeriod` | Finance | 4 |

**Migration naming convention**: `prisma migrate dev --name <phase>-<description>`

Example sequence:
```bash
prisma migrate dev --name pos-core           # Phase 1
prisma migrate dev --name inventory-core     # Phase 2
prisma migrate dev --name finance-core       # Phase 4
prisma migrate dev --name promotions-loyalty # Phase 5
```

---

## 9. Risks & Gaps

| Risk | Impact | Mitigation |
|------|--------|-----------|
| No real payment terminal integration | HIGH — POS non-functional in production | Add Stripe Terminal SDK or Heartland Portico in Phase 1. Mock sufficient for dev/demo only. |
| Inventory not decrementing on sale | HIGH — overselling at launch | Wire `InventoryMovement` from finalize route in Phase 1 before go-live. |
| No auth / session system | HIGH — any user sees any page | Add NextAuth.js with role-based middleware in Phase 1. Block all `/api/pos/` routes behind session. |
| SQLite concurrency under multi-register load | MEDIUM — write contention on busy stores | Plan migration to PostgreSQL (via Prisma provider swap) before multi-register deployment. SQLite fine for single-register or demo. |
| Tax rate hardcoded at 8.25% | MEDIUM — wrong tax in non-TX jurisdictions | Build `TaxJurisdiction` + `TaxRate` in Phase 4; swap out hardcode in Phase 4. |
| No receipt printer integration | MEDIUM — digital-only receipts at launch | Add ESC/POS printer driver (node-escpos or star-micronics-sdk) in Phase 2. |
| Barcode scanner not wired to input | MEDIUM — keyboard entry only at launch | Add HID keyboard wedge event listener to scan field in Phase 1. USB scanners send keystrokes terminated by `\n`. |
| No offline mode | MEDIUM — card payments fail on connectivity loss | Add service worker + IndexedDB offline queue in Phase 2. |
| Promotions engine not wired to POS | HIGH — advertised promos not applying | Wire `evaluate` endpoint into cart change handler in Phase 5. |
| No customer display (second screen) | LOW | Add second-screen mode via BroadcastChannel API in future phase. |
| PCI-DSS: card data in local storage | HIGH — compliance violation | Never store raw card data. Offline mode must use tokenized data only (processor token, not PAN). |
| GDPR: no customer data deletion | MEDIUM | Add `/api/admin/customer/[id]/delete` with anonymization (not hard delete) in Phase 6. |

---

## 10. Final Enterprise Clone Checklist

### Must-Have Before Go-Live

- [ ] Real payment terminal integration (Stripe Terminal / Heartland Portico)
- [ ] NextAuth authentication system with role-based route middleware
- [ ] Transaction finalization wired to Prisma (not local state)
- [ ] Inventory decrement on sale (real-time, via `InventoryMovement`)
- [ ] Register open / close with Z-report
- [ ] Receipt printer integration (ESC/POS)
- [ ] Tax jurisdiction table (replace hardcoded 8.25%)
- [ ] Manager override flow with PIN and audit log
- [ ] Loyalty points earn and redeem wired
- [ ] Gift card issuance and redemption wired
- [ ] Return processing at POS (with and without receipt)
- [ ] Role-based permission enforcement on all POS actions
- [ ] Idempotency keys on all write operations (prevent double-finalize)
- [ ] Input validation on all API routes (Zod schemas)

### Nice-to-Have for Launch

- [ ] Email receipt (SendGrid / Postmark)
- [ ] SMS receipt (Twilio)
- [ ] Barcode label printing (ZPL via Zebra printer or PDF label)
- [ ] Offline mode with sync queue (service worker + IndexedDB)
- [ ] Self-checkout kiosk mode (hide cashier controls, customer-facing layout)
- [ ] Mobile POS (tablet-optimized layout, touch-first numpad)
- [ ] Ecommerce order integration (pull online orders into fulfillment queue)
- [ ] Customer display second screen (BroadcastChannel API)

### Enterprise-Grade Hardening

- [ ] Full audit log (`AuditEvent` on every mutation, every module)
- [ ] GDPR customer data export (JSON) and anonymization (not hard delete)
- [ ] PCI-DSS compliance: no raw PAN storage, tokenized card data only
- [ ] Multi-store inventory isolation (storeId scoping on all inventory queries)
- [ ] HQ consolidation reports (roll-up across all store IDs)
- [ ] Automated database backup (nightly, encrypted, off-site)
- [ ] Rate limiting on all API routes (Upstash ratelimit or custom middleware)
- [ ] Input validation with Zod on all `req.body` in API routes
- [ ] HTTPS enforcement (HSTS header)
- [ ] Content Security Policy header
- [ ] Dependency audit (`npm audit` in CI)
- [ ] End-to-end tests for POS critical path (Playwright: scan → pay → complete → Z-report)

---

*End of NovaPOS Enterprise Clone Specification v1.0*
*Generated: April 22, 2026*
*Platform: Next.js 15 + TypeScript + Prisma + SQLite + Tailwind CSS 4*
*Do not write "Microsoft Dynamics 365" anywhere in the platform UI or code comments.*
