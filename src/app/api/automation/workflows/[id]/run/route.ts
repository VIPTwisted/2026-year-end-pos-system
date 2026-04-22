import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MOCK_TRIGGER_DATA: Record<string, Record<string, unknown>> = {
  'order-created': { orderId: 'ord_sim001', orderTotal: 524.99, customerEmail: 'customer@example.com', items: 3 },
  'order-shipped': { orderId: 'ord_sim001', trackingNumber: 'TRK123456789', carrier: 'UPS' },
  'payment-received': { orderId: 'ord_sim001', amount: 524.99, method: 'credit_card' },
  'inventory-low': { productId: 'prod_sim001', sku: 'SKU-001', currentStock: 4, reorderPoint: 10 },
  'customer-created': { customerId: 'cust_sim001', email: 'new@example.com', name: 'Jane Doe' },
  'loyalty-tier-change': { customerId: 'cust_sim001', oldTier: 'silver', newTier: 'gold', points: 5200 },
  'case-created': { caseId: 'case_sim001', subject: 'Delivery Issue', priority: 'high' },
  'case-resolved': { caseId: 'case_sim001', resolution: 'Refund issued', agentId: 'agent_001' },
  'shift-started': { employeeId: 'emp_sim001', storeId: 'store_001', shiftStart: new Date().toISOString() },
  'shift-ended': { employeeId: 'emp_sim001', hoursWorked: 8.5, tips: 42.0 },
  'daily-schedule': { scheduledAt: new Date().toISOString(), type: 'daily' },
  'weekly-schedule': { scheduledAt: new Date().toISOString(), type: 'weekly', weekNumber: 17 },
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const workflow = await prisma.automationWorkflow.findUnique({
    where: { id },
    include: { actions: { orderBy: { position: 'asc' } } },
  })
  if (!workflow) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const start = Date.now()
  const triggerData = MOCK_TRIGGER_DATA[workflow.trigger] ?? { trigger: workflow.trigger, simulatedAt: new Date().toISOString() }
  const actionsRun = workflow.actions.length
  const duration = Date.now() - start + Math.floor(Math.random() * 120) + 30

  const [run] = await prisma.$transaction([
    prisma.workflowRun.create({
      data: {
        workflowId: id,
        workflowName: workflow.name,
        trigger: workflow.trigger,
        status: 'success',
        triggerData: JSON.stringify(triggerData),
        actionsRun,
        duration,
      },
    }),
    prisma.automationWorkflow.update({
      where: { id },
      data: { runCount: { increment: 1 }, lastRunAt: new Date() },
    }),
  ])

  return NextResponse.json({ run, actionsRun, duration, triggerData })
}
