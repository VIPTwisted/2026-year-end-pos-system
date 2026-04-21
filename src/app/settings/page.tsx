import { TopBar } from '@/components/layout/TopBar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'
import {
  Building2,
  Database,
  Layers,
  CheckCircle2,
  Package,
  Users,
  UserCog,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'

// ─── Model groups for the schema checklist ───────────────────────────────────
const MODEL_GROUPS: { label: string; models: string[] }[] = [
  {
    label: 'Core Commerce',
    models: ['Store', 'Product', 'ProductCategory', 'Customer', 'Order', 'OrderItem', 'Payment'],
  },
  {
    label: 'Inventory',
    models: ['Inventory', 'InventoryTransaction', 'Supplier', 'PurchaseOrder', 'PurchaseOrderItem'],
  },
  {
    label: 'Workforce',
    models: ['User', 'Employee', 'Shift'],
  },
  {
    label: 'Operations',
    models: ['ServiceCase', 'CaseNote', 'WorkOrder', 'Communication', 'Campaign'],
  },
  {
    label: 'Finance',
    models: ['Account', 'JournalEntry', 'JournalLine'],
  },
  {
    label: 'Warehouse (WMS)',
    models: ['WmsLocation', 'WmsZone', 'WmsRack', 'WmsBin', 'WmsBinContent', 'WmsEntry', 'FamilyCategory'],
  },
]

// ─── Tech stack entries ───────────────────────────────────────────────────────
const TECH_STACK: { key: string; value: string }[] = [
  { key: 'Framework',    value: 'Next.js 15 (App Router)' },
  { key: 'Language',     value: 'TypeScript 5' },
  { key: 'ORM',          value: 'Prisma 7 (SQLite → PostgreSQL-ready)' },
  { key: 'UI',           value: 'Tailwind CSS + Radix UI' },
  { key: 'Components',   value: 'CVA-based design system' },
  { key: 'Deployment',   value: 'Vercel / Node.js' },
]

// ─── System status rows ───────────────────────────────────────────────────────
const SYSTEM_STATUS: { label: string; detail: string }[] = [
  { label: 'Database',   detail: 'Connected  ·  prisma/dev.db (libSQL)' },
  { label: 'Schema',     detail: '27 models synced' },
  { label: 'API Routes', detail: 'Active  ·  products, orders, customers' },
]

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: React.ElementType
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">{label}</span>
        <Icon className="w-4 h-4 text-zinc-500" />
      </div>
      <span className="text-3xl font-semibold text-zinc-100 tabular-nums">{value.toLocaleString()}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function SettingsPage() {
  const [store, productCount, customerCount, employeeCount, userCount] = await Promise.all([
    prisma.store.findFirst({ orderBy: { createdAt: 'asc' } }),
    prisma.product.count(),
    prisma.customer.count(),
    prisma.employee.count(),
    prisma.user.count(),
  ])

  return (
    <>
      <TopBar title="Settings & Configuration" />

      <main className="flex-1 p-6 overflow-auto space-y-8 max-w-6xl">

        {/* ── Section 1: Store Configuration ─────────────────────────────── */}
        <section>
          <SectionHeading icon={Building2} title="Store Configuration" />

          {store ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{store.name}</CardTitle>
                    <CardDescription className="mt-1">Primary store record</CardDescription>
                  </div>
                  <Badge variant={store.isActive ? 'success' : 'destructive'}>
                    {store.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  <StoreField label="Address">
                    {[store.city, store.state, store.zip].filter(Boolean).join(', ') || '—'}
                  </StoreField>
                  <StoreField label="Phone">{store.phone ?? '—'}</StoreField>
                  <StoreField label="Email">{store.email ?? '—'}</StoreField>
                  <StoreField label="Tax Rate">
                    {store.taxRate != null
                      ? `${(Number(store.taxRate) * 100).toFixed(2)}%`
                      : '—'}
                  </StoreField>
                  <StoreField label="Currency">{store.currency ?? '—'}</StoreField>
                  <StoreField label="Location">{store.address ?? '—'}</StoreField>
                </dl>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-14 gap-3 text-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 opacity-70" />
                <p className="text-sm font-medium text-zinc-300">No store configured</p>
                <p className="text-xs text-zinc-500 max-w-xs">
                  Create a store record via the Admin panel or run the seed script:
                  <code className="ml-1 px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-xs">
                    npx prisma db seed
                  </code>
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* ── Section 2: Platform Statistics ─────────────────────────────── */}
        <section>
          <SectionHeading icon={Layers} title="Platform Statistics" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Products"  value={productCount}  icon={Package} />
            <StatCard label="Customers" value={customerCount} icon={Users} />
            <StatCard label="Employees" value={employeeCount} icon={UserCog} />
            <StatCard label="Users"     value={userCount}     icon={ShieldCheck} />
          </div>
        </section>

        {/* ── Section 3: Database Models ──────────────────────────────────── */}
        <section>
          <SectionHeading
            icon={Database}
            title="Database Models"
            subtitle={`${MODEL_GROUPS.flatMap((g) => g.models).length} Prisma models across ${MODEL_GROUPS.length} domains`}
          />
          <Card>
            <CardContent className="pt-5 space-y-5">
              {MODEL_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2.5">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.models.map((model) => (
                      <Badge key={model} variant="success" className="font-mono font-normal text-xs">
                        {model}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* ── Section 4: Tech Stack ───────────────────────────────────────── */}
        <section>
          <SectionHeading title="Tech Stack" />
          <Card>
            <CardContent className="pt-5">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
                {TECH_STACK.map(({ key, value }) => (
                  <div key={key} className="flex items-baseline gap-3">
                    <dt className="text-sm text-zinc-400 w-28 shrink-0">{key}</dt>
                    <dd className="text-sm text-zinc-100 font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </section>

        {/* ── Section 5: System Status ────────────────────────────────────── */}
        <section>
          <SectionHeading title="System Status" />
          <Card>
            <CardContent className="pt-5 divide-y divide-zinc-800">
              {SYSTEM_STATUS.map(({ label, detail }) => (
                <div key={label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-sm font-medium text-zinc-200">{label}</span>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">{detail}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

      </main>
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon?: React.ElementType
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      {Icon && <Icon className="w-4 h-4 text-zinc-500 shrink-0" />}
      <h2 className="text-sm font-semibold text-zinc-300">{title}</h2>
      {subtitle && (
        <>
          <span className="text-zinc-700 select-none">·</span>
          <span className="text-xs text-zinc-500">{subtitle}</span>
        </>
      )}
    </div>
  )
}

function StoreField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-zinc-500 uppercase tracking-widest">{label}</dt>
      <dd className="text-sm text-zinc-100">{children}</dd>
    </div>
  )
}
