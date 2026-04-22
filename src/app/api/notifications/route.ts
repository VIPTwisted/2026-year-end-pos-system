import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface AppNotification {
  id: string
  type: 'warning' | 'info' | 'error'
  title: string
  message: string
  href: string
  createdAt: string
}

export async function GET() {
  const now = new Date().toISOString()
  const notifications: AppNotification[] = []

  // Low-stock items
  try {
    const lowStockItems = await prisma.inventory.findMany({
      where: {
        product: {
          trackStock: true,
          isActive: true,
          reorderPoint: { not: null },
        },
      },
      include: { product: true },
    })

    const belowReorder = lowStockItems.filter(
      (inv) =>
        inv.product.reorderPoint !== null &&
        inv.quantity <= inv.product.reorderPoint!,
    )

    if (belowReorder.length > 0) {
      notifications.push({
        id: `low-stock-${belowReorder.length}`,
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${belowReorder.length} item${belowReorder.length !== 1 ? 's are' : ' is'} below reorder point`,
        href: '/inventory',
        createdAt: now,
      })
    }
  } catch {
    // model may not be queryable — skip
  }

  // Customer orders pending fulfillment
  try {
    const openOrders = await prisma.order.findMany({
      where: { status: 'customer_order' },
      select: { id: true },
    })

    if (openOrders.length > 0) {
      notifications.push({
        id: `customer-orders-${openOrders.length}`,
        type: 'info',
        title: 'Customer Orders Pending',
        message: `${openOrders.length} order${openOrders.length !== 1 ? 's' : ''} need${openOrders.length === 1 ? 's' : ''} fulfillment`,
        href: '/customer-orders',
        createdAt: now,
      })
    }
  } catch {
    // skip
  }

  // Open service cases
  try {
    const openCases = await prisma.serviceCase.findMany({
      where: { status: 'open' },
      select: { id: true },
    })

    if (openCases.length > 0) {
      notifications.push({
        id: `service-cases-${openCases.length}`,
        type: 'info',
        title: 'Open Service Cases',
        message: `${openCases.length} case${openCases.length !== 1 ? 's' : ''} need${openCases.length === 1 ? 's' : ''} attention`,
        href: '/crm/service-cases',
        createdAt: now,
      })
    }
  } catch {
    // skip
  }

  // Overdue invoices (past due date, not fully paid)
  try {
    const overdueInvoices = await prisma.customerInvoice.findMany({
      where: {
        dueDate: { lt: new Date() },
        status: { in: ['posted', 'partial'] },
      },
      select: { id: true },
    })

    if (overdueInvoices.length > 0) {
      notifications.push({
        id: `overdue-invoices-${overdueInvoices.length}`,
        type: 'error',
        title: 'Overdue Invoices',
        message: `${overdueInvoices.length} invoice${overdueInvoices.length !== 1 ? 's are' : ' is'} overdue`,
        href: '/finance/ar-aging',
        createdAt: now,
      })
    }
  } catch {
    // skip
  }

  // Layaways with outstanding balances
  try {
    const openLayaways = await prisma.order.findMany({
      where: { status: 'layaway' },
      select: { id: true },
    })

    if (openLayaways.length > 0) {
      notifications.push({
        id: `layaways-${openLayaways.length}`,
        type: 'info',
        title: 'Open Layaways',
        message: `${openLayaways.length} layaway${openLayaways.length !== 1 ? 's have' : ' has'} outstanding balance${openLayaways.length !== 1 ? 's' : ''}`,
        href: '/orders?status=layaway',
        createdAt: now,
      })
    }
  } catch {
    // skip
  }

  // Cash drawer variance alerts
  try {
    const varAlerts = await prisma.shiftVarianceAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    for (const va of varAlerts) {
      const sign = va.variance < 0 ? '-' : '+'
      const abs = Math.abs(va.variance).toFixed(2)
      notifications.push({
        id: `variance-${va.id}`,
        type: 'error' as const,
        title: 'Cash Drawer Variance',
        message: `${va.cashierName} · ${va.registerId} · ${sign}$${abs} variance`,
        href: '/reports/register',
        createdAt: va.createdAt.toISOString(),
      })
    }
  } catch { /* skip if model not ready */ }

  return NextResponse.json({
    notifications,
    unreadCount: notifications.length,
  })
}
