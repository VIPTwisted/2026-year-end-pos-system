import { prisma } from '@/lib/prisma'
import { TopBar } from '@/components/layout/TopBar'
import { AlertTriangle, Info, XCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface NotificationItem {
  id: string
  type: 'warning' | 'info' | 'error'
  title: string
  message: string
  href: string
  detail?: string
}

async function buildNotifications(): Promise<NotificationItem[]> {
  const items: NotificationItem[] = []

  // ── LOW STOCK ─────────────────────────────────────────────────────────
  try {
    const allInventory = await prisma.inventory.findMany({
      where: {
        product: {
          trackStock: true,
          isActive: true,
          reorderPoint: { not: null },
        },
      },
      include: { product: true },
    })

    const belowReorder = allInventory.filter(
      (inv) =>
        inv.product.reorderPoint !== null &&
        inv.quantity <= inv.product.reorderPoint!,
    )

    for (const inv of belowReorder) {
      items.push({
        id: `low-stock-${inv.id}`,
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${inv.product.name} (SKU: ${inv.product.sku})`,
        href: `/inventory`,
        detail: `Qty on hand: ${inv.quantity} — Reorder point: ${inv.product.reorderPoint}`,
      })
    }
  } catch {
    // model may not be accessible
  }

  // ── CUSTOMER ORDERS ───────────────────────────────────────────────────
  try {
    const openOrders = await prisma.order.findMany({
      where: { status: 'customer_order' },
      select: { id: true, orderNumber: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    for (const order of openOrders) {
      items.push({
        id: `customer-order-${order.id}`,
        type: 'info',
        title: 'Customer Order Pending',
        message: `Order #${order.orderNumber}`,
        href: `/orders/${order.id}`,
        detail: `Created ${order.createdAt.toLocaleDateString()}`,
      })
    }
  } catch {
    // skip
  }

  // ── OPEN SERVICE CASES ────────────────────────────────────────────────
  try {
    const openCases = await prisma.serviceCase.findMany({
      where: { status: 'open' },
      select: {
        id: true,
        caseNumber: true,
        title: true,
        priority: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    for (const sc of openCases) {
      items.push({
        id: `service-case-${sc.id}`,
        type: 'info',
        title: 'Open Service Case',
        message: sc.title || `Case #${sc.caseNumber}`,
        href: `/crm/service-cases`,
        detail: `Priority: ${sc.priority} — Opened ${sc.createdAt.toLocaleDateString()}`,
      })
    }
  } catch {
    // skip
  }

  // ── OVERDUE INVOICES ──────────────────────────────────────────────────
  try {
    const overdueInvoices = await prisma.customerInvoice.findMany({
      where: {
        dueDate: { lt: new Date() },
        status: { in: ['posted', 'partial'] },
      },
      include: { customer: true },
      orderBy: { dueDate: 'asc' },
    })

    for (const inv of overdueInvoices) {
      const daysOverdue = Math.floor(
        (Date.now() - inv.dueDate.getTime()) / 86_400_000,
      )
      items.push({
        id: `invoice-${inv.id}`,
        type: 'error',
        title: 'Overdue Invoice',
        message: `Invoice #${inv.invoiceNumber} — ${inv.customer.firstName} ${inv.customer.lastName}`,
        href: `/finance/ar-aging`,
        detail: `${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue — $${inv.totalAmount.toFixed(2)} outstanding`,
      })
    }
  } catch {
    // skip
  }

  // ── OPEN LAYAWAYS ─────────────────────────────────────────────────────
  try {
    const openLayaways = await prisma.order.findMany({
      where: { status: 'layaway' },
      select: { id: true, orderNumber: true, totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    for (const lay of openLayaways) {
      items.push({
        id: `layaway-${lay.id}`,
        type: 'info',
        title: 'Open Layaway',
        message: `Order #${lay.orderNumber}`,
        href: `/orders/${lay.id}`,
        detail: `Balance: $${lay.totalAmount.toFixed(2)} — Opened ${lay.createdAt.toLocaleDateString()}`,
      })
    }
  } catch {
    // skip
  }

  return items
}

const TYPE_LABEL: Record<NotificationItem['type'], string> = {
  error: 'Errors',
  warning: 'Warnings',
  info: 'Info',
}

const borderColor: Record<NotificationItem['type'], string> = {
  warning: 'border-l-amber-500',
  error: 'border-l-red-500',
  info: 'border-l-blue-500',
}

const iconClass: Record<NotificationItem['type'], string> = {
  warning: 'text-amber-400',
  error: 'text-red-400',
  info: 'text-blue-400',
}

function NotificationIcon({ type }: { type: NotificationItem['type'] }) {
  const cls = `w-4 h-4 shrink-0 mt-0.5 ${iconClass[type]}`
  if (type === 'warning') return <AlertTriangle className={cls} />
  if (type === 'error') return <XCircle className={cls} />
  return <Info className={cls} />
}

export default async function NotificationsPage() {
  const allItems = await buildNotifications()

  // Group by type, sorted errors → warnings → info
  const types = (['error', 'warning', 'info'] as const).filter((t) =>
    allItems.some((n) => n.type === t),
  )

  const grouped = types.map((t) => ({
    type: t,
    items: allItems.filter((n) => n.type === t),
  }))

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Notifications" />

      <main className="max-w-4xl mx-auto p-6 space-y-6">

        {allItems.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-12 flex flex-col items-center gap-3 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <p className="text-base font-semibold text-zinc-200">All Clear</p>
            <p className="text-sm text-zinc-500">
              No alerts, overdue invoices, or pending items right now.
            </p>
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-400">
                {allItems.length} active alert{allItems.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2 ml-auto">
                {types.map((t) => {
                  const count = allItems.filter((n) => n.type === t).length
                  const colorMap = {
                    error: 'bg-red-500/10 text-red-400',
                    warning: 'bg-amber-500/10 text-amber-400',
                    info: 'bg-blue-500/10 text-blue-400',
                  }
                  return (
                    <span
                      key={t}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${colorMap[t]}`}
                    >
                      {count} {TYPE_LABEL[t]}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Groups */}
            {grouped.map(({ type, items }) => (
              <section key={type}>
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                  {TYPE_LABEL[type]}
                </h2>

                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden divide-y divide-zinc-800/40">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex gap-3 px-4 py-3 border-l-2 ${borderColor[item.type]} hover:bg-zinc-800/30 transition-colors`}
                    >
                      <NotificationIcon type={item.type} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-zinc-100 leading-snug">
                          {item.title}
                        </p>
                        <p className="text-sm text-zinc-300 mt-0.5">
                          {item.message}
                        </p>
                        {item.detail && (
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            {item.detail}
                          </p>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-600 self-center shrink-0">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </main>
    </div>
  )
}
