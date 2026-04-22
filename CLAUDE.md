# NovaPOS — Project CLAUDE.md
# Elite Engineering & Design Bible
# Auto-loaded every session. Every agent reads this first.

---

## IDENTITY

- **Project:** NovaPOS — full D365 Business Central + Commerce + Supply Chain clone
- **Owner:** VIPTwisted · globalimporterexports@gmail.com
- **Stack:** Next.js 15 App Router · TypeScript · Prisma + LibSQL · NextAuth v5 · Tailwind CSS · shadcn/ui
- **DB:** SQLite via LibSQL (`prisma/dev.db`) — adapter: `PrismaLibSql({ url: 'file:prisma/dev.db' })`
- **Auth:** NextAuth v5 — roles: `admin`, `manager`, `cashier`, `warehouse`, `accountant`
- **Path:** `C:\Users\DeMar\Desktop\2026-year-end-pos`

---

## TWO-REPO STRATEGY — MEMORIZED PERMANENTLY

> These rules apply every session. Do NOT ask the user to repeat them.

### Repos
| Repo | Path | GitHub | Purpose |
|------|------|--------|---------|
| **2026-year-end-pos** | `C:/Users/DeMar/Desktop/2026-year-end-pos/` | VIPTwisted/2026-year-end-pos-system | **Pure D365 clone master** — source of truth for all D365 features |
| **NovaPOS** | `C:/Users/DeMar/Desktop/NovaPOS/` | VIPTwisted/NovaPOS | D365 clone + extra added features on top |

### Rules
1. **D365 core features must be byte-for-byte identical in both repos.** Every new D365 page/API/schema change goes to BOTH repos.
2. **NovaPOS may have extra added features** that don't exist in 2026-year-end-pos — that's fine and expected.
3. **`2026-year-end-pos` is the D365 master.** When D365 core pages differ between repos, 2026-year-end-pos wins.
4. **NovaPOS-only extra pages stay only in NovaPOS** — do not delete them.
5. **Sync rule (additive for NovaPOS):** Files missing from NovaPOS → copy from 2026-year-end-pos. Files missing from 2026-year-end-pos → copy from NovaPOS. D365 core files in both → 2026-year-end-pos overwrites NovaPOS.
6. **Both repos pushed to GitHub at the end of every session.**
7. **Document source:** `C:/Users/DeMar/Documents/2026 YEAR END POS DOCUMENTS/` — user continuously adds D365 PDFs here. Any new file = new D365 features to clone. Agent must check this folder every session.
8. **Do not ask the user about repo strategy — this is the rule, follow it.**

---

## ABSOLUTE RULES — NEVER VIOLATE

1. **Zero TypeScript errors always.** Run `npx tsc --noEmit` before reporting any task done.
2. **No placeholders, stubs, or TODOs in production code.** Every function must do real work.
3. **`'use client'` must be the literal first line** of any file that uses hooks. Nothing before it — not imports, not `export const dynamic`, nothing.
4. **No `any` type.** Use `unknown`, proper interfaces, or Prisma-generated types.
5. **No hardcoded IDs, fake data, or mock responses in API routes.** All data comes from Prisma.
6. **Never delete files without explicit instruction.**
7. **Secrets in env vars only.** Never in source code.
8. **Parallel agents for every multi-file task.** Idle compute is waste.
9. **Build must pass before task is complete.** `npx tsc --noEmit` = 0 errors.
10. **No feature flags, no backwards-compat shims.** Change the code directly.

---

## DESIGN SYSTEM — LOCKED TOKENS

### Admin / Back-Office Palette
```
Page background:     #0f0f1a
Card background:     #16213e
Card border:         border-zinc-800/50
Sidebar background:  #0f0f1a
Header background:   #0f0f1a  border-b border-zinc-800
Table row divider:   border-zinc-800
Muted text:          text-zinc-500
Body text:           text-zinc-100
Label style:         text-[10px] font-semibold uppercase tracking-widest text-zinc-500
Input bg:            bg-zinc-900 border border-zinc-700 rounded
Input focus:         focus:border-blue-500
Primary action:      bg-blue-600 hover:bg-blue-700
Success/active:      text-emerald-400  bg-emerald-500/10
Danger:              text-red-400  bg-red-500/10
Warning:             text-amber-400  bg-amber-500/10
Info:                text-blue-400  bg-blue-500/10
```

### POS Terminal Palette (LOCKED — never change)
```
Top bar / side navs: #1e2a3a
D365 primary blue:   #0078d4   (action tiles, selection, links)
D365 green:          #107c10   (pay, success, loyalty balance)
D365 red:            #d13438   (void, error, danger)
D365 dark tile:      #323130   (Voids, Tax overrides)
Cart bg:             white
Customer panel bg:   white
Action tiles bg:     #f4f4f4
Numpad key:          bg-gray-100 hover:bg-[#deecf9] hover:text-[#0078d4]
Selected cart row:   bg-[#0078d4] text-white
Hover cart row:      hover:bg-[#f3f9fd]
```

### Typography
```
Page title:      text-xl font-bold text-zinc-100
Section header:  text-[10px] font-semibold uppercase tracking-widest text-zinc-500
Table header:    text-[10px] font-semibold uppercase tracking-widest text-zinc-500
Table cell:      text-sm text-zinc-200
Monospace data:  font-mono text-zinc-400
Currency:        tabular-nums font-semibold
```

### Layout Grid
```
Admin page:     max-w-7xl mx-auto p-6 space-y-6
Card:           bg-[#16213e] border border-zinc-800/50 rounded-lg
Table wrapper:  overflow-x-auto  rounded-lg border border-zinc-800/50
Min height:     min-h-[100dvh]   (NEVER h-screen)
Spacing unit:   8px grid — use Tailwind gap-2, gap-4, gap-6, gap-8
```

### Component Patterns
```tsx
// Stat card
<div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">LABEL</div>
  <div className="text-2xl font-bold text-zinc-100">$0.00</div>
  <div className="text-xs text-zinc-500 mt-1">subtitle</div>
</div>

// Page header
<header className="h-14 border-b border-zinc-800 bg-[#0f0f1a] flex items-center px-6 gap-4 sticky top-0 z-10">
  <h1 className="text-base font-semibold text-zinc-100">Page Title</h1>
  <div className="ml-auto flex items-center gap-3">
    {/* actions */}
  </div>
</header>

// Status badge
<span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium
  ${status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
  {status}
</span>
```

---

## ARCHITECTURE RULES

### Next.js App Router
- All pages in `src/app/` — `page.tsx` for pages, `layout.tsx` for layouts
- API routes: `src/app/api/[resource]/route.ts`
- `'use client'` only when using hooks/browser APIs — default to server components
- Never put `export const dynamic = 'force-dynamic'` before `'use client'`
- Dynamic routes: `[id]/page.tsx` — params are `Promise<{ id: string }>` in Next.js 15

### API Routes — Standard Pattern
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    // ... prisma query
    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // ... validate, then create
    return NextResponse.json(result, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Prisma Client
```typescript
// ALWAYS use the singleton at src/lib/prisma.ts — never create a new PrismaClient inline
import { prisma } from '@/lib/prisma'
```

### Error Handling
- API routes: always wrap in try/catch, return `{ error: string }` with correct status code
- Client fetch: always check `res.ok` — show error toast on failure, re-open modal for retry
- Never swallow errors silently

### State Management
- Local UI state: `useState` + `useReducer` (no external state lib)
- POS cart state: `POSProvider` / `usePOS` from `@/lib/pos/context`
- Server state: direct `fetch` in `useEffect` — no SWR/React Query needed at this scale

---

## POS ARCHITECTURE (LOCKED)

### Layout (5-column, full viewport)
```
[Left nav w-12 #1e2a3a] [Transaction panel flex-1 white] [Customer+Numpad w-64 white] [Action tiles w-[220px] #f4f4f4] [Right nav w-14 #1e2a3a]
```

### Transaction Panel Structure
```
Tabs bar (Lines / Payments) — flex-shrink-0
Column headers — flex-shrink-0 — ONLY when cartLines.length > 0
Scrollable cart lines — flex-1 overflow-y-auto
Recommended products — flex-shrink-0 OUTSIDE scroll — NEVER inside scroll div
Footer stats — flex-shrink-0
```

### Customer Panel Structure
```
Customer section — flex-shrink-0 (with real loyalty data from API)
flex-1 spacer — pushes numpad to bottom
Numpad — flex-shrink-0 pinned to bottom
  Layout: rows 1-3 (4 keys), row 4 (0=col-span-3, abc=col-span-1), row 5 (Enter full-width blue)
```

### Void / Return Flow (MANDATORY)
- EVERY void (transaction or line) triggers the Manager Approval Modal
- Requires: reason code dropdown + manager PIN (min 4 digits)
- Disabled until both fields filled
- On approve: execute void + log reason

### Cashier Logout (MANDATORY)
- Every completed transaction → 20-second countdown → `signOut({ callbackUrl: '/login' })`
- No role check — ALL roles log out after transaction
- "Sign Out Now" button always present

### Payment Methods (ALL 8 WIRED)
`visa` | `mastercard` | `amex` | `debit` | `cash` | `gift-card` | `store-credit` | `loyalty`

---

## AGENT DEPLOYMENT PROTOCOL

### When to spawn agents
- Any task touching 3+ files → spawn agents
- Build verification → always background agent
- Data seeding → background agent
- Audit/review → background Explore agent
- UI changes → verify with TypeScript agent after

### Agent types mapped to tasks
```
general-purpose  → seeding, API fixes, multi-file features
Explore          → audits, PDF parsing, codebase research  
code-reviewer    → pre-PR review, risky changes
test-runner      → after any API or business logic change
docs-writer      → CLAUDE.md updates, runbooks
```

### Always run in parallel when independent
```typescript
// CORRECT — 3 agents launched in one message
Agent({ build check... })
Agent({ seed data... })
Agent({ page audit... })

// WRONG — launching one at a time while others wait
```

---

## QUALITY GATES — CHECKLIST BEFORE ANY TASK IS "DONE"

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] No `any` types introduced
- [ ] No `window.confirm()` or `window.prompt()` — use modals
- [ ] All new API routes have try/catch
- [ ] All new client fetches check `res.ok` and show error toast on failure
- [ ] New pages have proper `'use client'` placement
- [ ] Design tokens match locked palette above
- [ ] No hardcoded fake data in routes

---

## MODULE INVENTORY — WHAT EXISTS

### Core POS (`/pos`)
Cart · Action tiles · Customer panel · Numpad · Payment modal (8 methods) · Void modal · Barcode scan · Loyalty lookup · Gift card lookup · Customer search (name + loyalty tab) · Cashier auto-logout · Receipt screen

### Products & Inventory (`/products`, `/inventory`)
Product CRUD · Categories · Suppliers · Stock levels · Reorder points

### Customers & CRM (`/customers`, `/crm`)
Customer CRUD · Loyalty cards · Service cases · Communications

### Orders (`/orders`)
Order history · Order detail · Line items · Payment records

### Finance (`/finance`, `/budget`)
GL Accounts · Journal entries · AR/AP · Budget plans · Financial reports

### Purchasing (`/purchasing`)
Purchase orders · Supplier management · Receiving

### HR / Employees (`/hr`)
Employee profiles · Positions · Attendance

### Analytics (`/analytics`, `/reports`)
Sales dashboards · Product performance · Customer analytics

### Settings (`/settings`)
Store config · Users · Roles · Tax rates · Payment terminals

---

## CUSTOMIZATION ROADMAP (ACTIVE — weeks of work)

### Phase 1 — POS Hardening
- [ ] Receipt printing (thermal + PDF)
- [ ] Shift open/close with drawer float
- [ ] X-report / Z-report
- [ ] Cash drawer kick command
- [ ] Loyalty point earning on sale
- [ ] Split tender payments
- [ ] Coupon/promo code application
- [ ] Age verification gate

### Phase 2 — Admin Modules Polish
- [ ] Real-time inventory dashboard
- [ ] Purchase order receiving workflow
- [ ] AR/AP aging reports
- [ ] Payroll module
- [ ] Commission tracking

### Phase 3 — Custom Branding
- [ ] White-label theming system
- [ ] Custom receipt templates
- [ ] Email/SMS notification templates
- [ ] Customer portal

### Phase 4 — Integrations
- [ ] Stripe / Square card processing
- [ ] QuickBooks sync
- [ ] Shopify channel sync
- [ ] Email marketing (Mailchimp/Klaviyo)

---

## SEED DATA INVENTORY (current state)

| Module | Count | Status |
|--------|-------|--------|
| Products | 56 | ✅ with Picsum photos |
| Categories | 8 | ✅ |
| Customers | 18 | ✅ with addresses |
| Suppliers | 10 | ✅ |
| Orders | 66+ | ✅ historical |
| Employees | 3 | ⚠️ needs more |
| Loyalty Programs | 0 | ❌ seed pending |
| Loyalty Cards | 0 | ❌ seed pending |
| Gift Cards | 0 | ❌ seed pending |
| GL Accounts | 8 | ⚠️ needs full COA |
| Budget Plans | 1 | ⚠️ needs more |
| Purchase Orders | 2 | ⚠️ needs more |
| Service Cases | 3 | ⚠️ needs more |
| Stores | 2 | ✅ |
| Users | 7 | ✅ |

---

## COMMON PATTERNS — COPY THESE

### Loading state
```tsx
const [loading, setLoading] = useState(true)
const [data, setData] = useState<T[]>([])
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  fetch('/api/resource')
    .then(r => r.json())
    .then(d => setData(d.items ?? d))
    .catch(() => setError('Failed to load'))
    .finally(() => setLoading(false))
}, [])
```

### Toast notification
```tsx
const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
  setToast({ msg, type })
  setTimeout(() => setToast(null), 2800)
}
```

### Currency format
```typescript
import { formatCurrency } from '@/lib/utils'
formatCurrency(amount) // → "$1,234.56"
```

### Confirm dangerous action — USE MODAL not window.confirm()
```tsx
// Always use a dedicated confirmation modal, never window.confirm()
// Example: VoidModal, DeleteModal, etc.
```

---

## SESSION START PROTOCOL

Every new session on this project:
1. Read this CLAUDE.md (auto-loaded)
2. Check `npx tsc --noEmit` — fix any drift
3. Check agent notifications for pending results
4. Resume from last known state in conversation or git log

---

## DEV SERVER

```bash
cd "C:\Users\DeMar\Desktop\2026-year-end-pos"
npm run dev          # localhost:3000
node scripts/seed-demo-products.ts     # reseed products
node scripts/seed-demo-customers-vendors.js  # reseed customers/vendors
node scripts/seed-all-modules.js       # reseed all modules
```

Login: admin@store.local / Admin1234!

---

*Last updated: 2026-04-21 | Every agent working on NovaPOS reads this file first.*
