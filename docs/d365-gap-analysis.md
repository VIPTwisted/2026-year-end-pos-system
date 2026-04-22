# D365 Commerce Gap Analysis
Generated: 2026-04-21

> Baseline: forensic scan of `src/app/api/` routes and `src/app/` pages against D365 Commerce feature categories.
> PDF was too large to extract (>100 MB); analysis is derived from codebase inventory against the D365 Commerce feature taxonomy.

---

## Feature Status

| Feature | D365 Section | Status | Implementation | Gap/Notes |
|---------|-------------|--------|----------------|-----------|
| Shift open | Store Operations | ✅ Complete | `POST /api/pos/shifts` | Float entry included |
| Shift close | Store Operations | ✅ Complete | `PATCH /api/pos/shifts/[id]` | closeFloat captured |
| Current shift query | Store Operations | ✅ Complete | `GET /api/pos/shifts?userId=` | Guards POS access |
| X-Report (mid-shift) | Store Operations | ✅ Complete | `GET /api/pos/shifts/[id]/x-report` | Payment breakdown |
| Z-Report (shift close) | Store Operations | ⚠️ Partial | `PATCH /api/pos/shifts/[id]` | API fires; no dedicated Z-report page/print view |
| POS transaction / checkout | Store Operations | ✅ Complete | `POST /api/orders` + `src/app/pos/page.tsx` | Full cart, tax, payments |
| Suspend transaction | Store Operations | ✅ Complete | `pos/page.tsx` opId 503 | localStorage queue |
| Recall suspended | Store Operations | ✅ Complete | `pos/page.tsx` opId 504 | Pops localStorage |
| Void transaction | Store Operations | ✅ Complete | opId 500 + void modal | Manager PIN required |
| Void line item | Store Operations | ✅ Complete | opId 102/103 + void modal | Manager PIN required |
| Manager void authorization API | Store Operations | ✅ Complete | `POST /api/pos/void/authorize` | bcrypt against passwordHash |
| Barcode scan entry | Store Operations | ✅ Complete | `pos/page.tsx` barcode input | SKU lookup |
| Product search | Store Operations | ✅ Complete | `GET /api/products` + POS search bar | Name + SKU |
| Customer search | Store Operations | ✅ Complete | `GET /api/customers?search=` + modal | Name/email/phone |
| Customer attach to transaction | Store Operations | ✅ Complete | `pos/page.tsx` SET_CUSTOMER dispatch | |
| Loyalty card scan at POS | Store Operations | ✅ Complete | opId 522; loyalty modal | |
| Loyalty balance lookup | Loyalty | ✅ Complete | `GET /api/loyalty/balance?card=` | |
| Loyalty earn at checkout | Loyalty | ✅ Complete | `POST /api/loyalty/cards/[id]/earn` | Called from orders route |
| Loyalty redeem | Loyalty | ✅ Complete | `POST /api/loyalty/cards/[id]/redeem` | Payment method wired |
| Loyalty issue card | Loyalty | ✅ Complete | opId 607 | Attaches to customer |
| Loyalty programs & tiers | Loyalty | ✅ Complete | `/api/loyalty/programs`, `/api/loyalty/tiers` | |
| Gift card issue | Payments | ✅ Complete | `POST /api/gift-cards` via opId 512 | |
| Gift card balance lookup | Payments | ✅ Complete | `GET /api/gift-cards?code=` | GC lookup modal in POS |
| Gift card payment | Payments | ✅ Complete | Payment modal + checkout API | giftCardNumber passed |
| Split tender | Payments | ✅ Complete | `pos/page.tsx` splitPayments state | Any combo of methods |
| Cash payment + change due | Payments | ✅ Complete | Cash tender input in POS | Change calculated client-side |
| Credit/debit card payment | Payments | ✅ Complete | Visa/MC/Amex/Debit in payment modal | AVS ZIP captured |
| Store credit payment | Payments | ✅ Complete | payment modal method | Requires attached customer |
| Loyalty points payment | Payments | ✅ Complete | payment modal method | Requires attached customer |
| Coupon / promo code | Promotions | ✅ Complete | `POST /api/coupons/validate` + POS | Discount applied to total |
| Promotions management | Promotions | ✅ Complete | `/api/promotions` CRUD | |
| Line discount % | Discounts | ✅ Complete | opId 300 + discount modal | |
| Transaction discount % | Discounts | ✅ Complete | opId 302 + discount modal | |
| Receipt API | Receipt Mgmt | ✅ Complete | `GET /api/pos/receipt/[orderId]` | |
| Receipt page (print) | Receipt Mgmt | ✅ Complete | `src/app/receipt/[orderId]/page.tsx` | |
| Age verification at POS | Compliance | ✅ Complete | `pos/page.tsx` showAgeModal, minAge field | Product.minAge |
| Returns API | Returns/Voids | ✅ Complete | `/api/returns`, `/api/returns/[id]` | REST CRUD |
| Line comment / product comments | Store Operations | ✅ Complete | opId 114 + comment modal | Cart line comment |
| Transaction comment | Store Operations | ✅ Complete | state.transactionComment | Passed to order |
| Price list lookup | Pricing | ✅ Complete | `/api/price-lists/lookup` | |
| Price lists management | Pricing | ✅ Complete | `/api/price-lists` CRUD | |
| Trade agreements | Pricing | ✅ Complete | `/api/trade-agreements/lookup` | |
| Kit disassembly | Products | ✅ Complete | `/api/products/kits/[productId]/disassemble` | |
| Kit management | Products | ✅ Complete | `/api/products/kits` | |
| Product variants | Products | ✅ Complete | `/api/products/[id]/variants` | |
| Serial number tracking | Warehouse | ✅ Complete | `/api/warehouse/serial-numbers` | Backend only; no POS entry prompt |
| Lot number tracking | Warehouse | ✅ Complete | `/api/warehouse/lot-numbers` | Backend only |
| Inventory transfers | Inventory | ✅ Complete | `/api/inventory/transfers` | |
| Stores management | Channel Mgmt | ✅ Complete | `/api/stores` | |
| Hardware station config | Configuration | ⚠️ Partial | `src/app/settings/page.tsx` | Settings page exists; no dedicated hardware-profiles sub-page or API |
| Inventory lookup at POS | Store Operations | ❌ Missing | — | No real-time stock check during POS add-to-cart |
| Price check mode | Store Operations | ❌ Missing | — | No customer-facing display / dedicated price-check endpoint |
| Tender declaration | Shift Management | ❌ Missing | — | closeFloat captured but no denomination-level cash count UI |
| Safe drop (mid-shift cash removal) | Shift Management | ❌ Missing | — | No `/api/pos/shifts/[id]/safe-drop` route |
| Bank drop | Shift Management | ❌ Missing | — | No `/api/pos/shifts/[id]/bank-drop` route |
| Float entry (mid-shift addition) | Shift Management | ❌ Missing | — | Opening float only; no mid-shift float add |
| Blind close | Shift Management | ❌ Missing | — | Close always requires closeFloat input; no blind-close flag |
| Petty cash in/out | Shift Management | ❌ Missing | — | No petty cash transaction type |
| Manager price override at POS | Discounts | ❌ Missing | — | opId 506 shows toast only; no price-override API |
| Override system date | Store Operations | ❌ Missing | — | No date override capability |
| Customer order (cross-store sell) | Fulfillment | ❌ Missing | — | No cross-store order creation from POS |
| Ship to customer (fulfillment) | Fulfillment | ⚠️ Partial | DOM + IOM modules exist | Not wired to POS checkout |
| Pick up in store | Fulfillment | ⚠️ Partial | IOM module | Not exposed at POS |
| RMA flow | Returns | ⚠️ Partial | `/api/returns` exists | No RMA number, authorization, or restocking workflow |
| Serial number entry at point of sale | Store Operations | ❌ Missing | — | Warehouse serial API exists but POS has no serial entry prompt |
| Receipt email | Receipt Mgmt | ❌ Missing | — | No `/api/pos/receipt/email` or email send trigger |
| Drawer kick test | Hardware | ❌ Missing | — | No cash drawer open API / test |
| Financial reconciliation (statements) | Back Office | ✅ Complete | `/api/statements` calculate + post | |
| Offline mode | Store Operations | ❌ Missing | — | No service worker / offline queue |
| Tax override (manager) | Tax | ⚠️ Partial | opId 506 shows toast | No tax-override API; needs manager auth |
| Channel management (ecommerce) | Channel Mgmt | ✅ Complete | `/api/ecommerce/channels` | |
| Fraud detection | Compliance | ✅ Complete | `/api/fraud/alerts`, `/api/fraud/rules` | |
| Audit logging | Back Office | ✅ Complete | `/api/audit/logs`, `/api/audit/changes` | AuditLog + ChangeLog models |

---

## Top 10 Highest-Priority Gaps

### 1. Tender Declaration (cash counting at shift close)
**Priority: Critical** — Required for financial reconciliation and loss prevention.
**Approach:** Add denomination breakdown modal to shift-close flow. Create `POST /api/pos/shifts/[id]/tender-declaration` storing denomination counts. Compute variance vs. expected cash. Wire into Z-Report.

### 2. Safe Drop / Bank Drop
**Priority: Critical** — Standard retail cash management; D365 tracks every fund movement.
**Approach:** `POST /api/pos/shifts/[id]/safe-drop` with `{ amount, reason, authorizedBy }`. Same endpoint pattern for bank drop. Add to POS action tiles and shift management page. Log to AuditLog.

### 3. Inventory Lookup at POS
**Priority: High** — Cashiers need real-time stock before adding items or when customers ask.
**Approach:** Add stock-level badge to product tiles in POS. `GET /api/products/[id]/stock` returning available qty by location. Wire from the barcode scan / product card click.

### 4. RMA Flow (Return Merchandise Authorization)
**Priority: High** — Current returns API is CRUD only; no authorization number, return reason codes, restocking logic, or credit issuance.
**Approach:** Extend `/api/returns` with `rmaNumber` (via number-series), `restockStatus`, and `creditAction` (refund/exchange/store-credit). Add RMA page UI under `/returns/[id]`.

### 5. Serial Number Entry at POS Sale
**Priority: High** — Regulatory requirement for electronics, warranty tracking.
**Approach:** Check `Product.trackSerial` flag when adding to cart. If set, show serial-number modal before adding the line. Pass `serialNumber` on each `OrderItem`. Wire to `/api/warehouse/serial-numbers` assignment.

### 6. Receipt Email
**Priority: High** — Customer expectation; reduces paper receipt hardware dependency.
**Approach:** `POST /api/pos/receipt/email` accepting `{ orderId, email }`. Use Next.js server action or nodemailer to send receipt HTML. Add "Email receipt" button to post-sale screen in `pos/page.tsx`.

### 7. Manager Price Override at POS
**Priority: Medium** — Required when system price is wrong or manager approves special pricing.
**Approach:** Wire opId 506 to a price-override modal similar to void modal (manager PIN + new price). Call `POST /api/pos/void/authorize` for PIN validation, then dispatch `SET_LINE_PRICE` action. Log override in AuditLog.

### 8. Petty Cash In/Out
**Priority: Medium** — Needed for shift reconciliation accuracy; common D365 Commerce operation.
**Approach:** `POST /api/pos/shifts/[id]/petty-cash` with `{ type: 'in'|'out', amount, reason }`. Show in X/Z reports. Add to POS action tiles under a "Cash Management" tile.

### 9. Price Check Mode / Customer-Facing Display
**Priority: Medium** — Enhances customer experience; D365 uses a second display.
**Approach:** `GET /api/pos/price-check?sku=` returning name, price, taxable flag. Separate `/pos/price-check` page that polls or uses EventSource for cashier-triggered lookups. Can be displayed on a secondary monitor.

### 10. Offline Mode
**Priority: Medium** — D365 Commerce has a built-in offline database; POS must survive connectivity loss.
**Approach:** Implement a service worker caching product catalog and customer list. Queue transactions in IndexedDB when offline. Sync via `POST /api/pos/sync` when connection restores. This is the largest engineering effort of the 10.

---

## Bonus: D365 Checklist Items — Quick Status

| D365 Feature | Status | Notes |
|---|---|---|
| Float entry (opening) | ✅ | `openFloat` in shift open |
| Float entry (mid-shift add) | ❌ | Not implemented |
| Blind close | ❌ | Always requires close float |
| Override system date | ❌ | Not implemented |
| Customer order (cross-store) | ❌ | No cross-store POS flow |
| Ship to customer from POS | ⚠️ | DOM/IOM exist but not POS-connected |
| Pick up in store | ⚠️ | IOM exists but not POS-connected |
| Drawer kick test | ❌ | No hardware API |
| Tax override (manager) | ⚠️ | Toast only; needs API |
| Offline mode | ❌ | No service worker |
