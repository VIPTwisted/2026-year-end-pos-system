import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { period: string }
    const { period } = body

    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      return NextResponse.json({ error: 'period must be in YYYY-MM format' }, { status: 400 })
    }

    // Parse period into date range
    const [year, month] = period.split('-').map(Number)
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    // Fetch completed orders in the period
    const orders = await prisma.order.findMany({
      where: {
        status: 'completed',
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    })

    // Fetch all active commission rates
    const rates = await prisma.commissionRate.findMany({
      where: { isActive: true },
      include: { employee: true },
    })

    // Fetch existing commissions for this period to skip duplicates
    const existingOrderIds = new Set(
      (
        await prisma.commission.findMany({
          where: { period },
          select: { orderId: true },
        })
      ).map(c => c.orderId)
    )

    // Fetch all active employees for role-based lookup
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
    })

    let created = 0
    let skipped = 0

    for (const order of orders) {
      if (existingOrderIds.has(order.id)) {
        skipped++
        continue
      }

      // Find employees at this store
      const storeEmployees = employees.filter(e => e.storeId === order.storeId)

      if (storeEmployees.length === 0) {
        skipped++
        continue
      }

      // For each store employee, find their commission rate (priority: employee > role > global)
      let assigned = false
      for (const employee of storeEmployees) {
        const employeeRate = rates.find(r => r.employeeId === employee.id && r.isActive)
        const roleRate = rates.find(r => r.role === employee.position && r.employeeId === null && r.isActive)
        const globalRate = rates.find(r => r.employeeId === null && r.role === null && r.isActive)

        const applicableRate = employeeRate ?? roleRate ?? globalRate

        if (!applicableRate) continue

        const saleAmount = order.totalAmount
        const rateValue = Number(applicableRate.rate)
        const commissionAmount = saleAmount * rateValue

        await prisma.commission.create({
          data: {
            employeeId: employee.id,
            orderId: order.id,
            rate: rateValue,
            saleAmount,
            amount: commissionAmount,
            period,
            status: 'pending',
          },
        })

        created++
        assigned = true
        break // One commission per order
      }

      if (!assigned) skipped++
    }

    return NextResponse.json({ created, skipped, period })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
