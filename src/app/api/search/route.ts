import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const q = sp.get('q')?.trim() ?? ''
    const rawLimit = parseInt(sp.get('limit') ?? '5', 10)
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 5 : Math.min(rawLimit, 50)

    if (!q) {
      return NextResponse.json({
        query: '',
        results: { customers: [], products: [], orders: [], employees: [], suppliers: [] },
        totalCount: 0,
      })
    }

    const [customers, products, orders, employees, suppliers] = await Promise.all([
      prisma.customer.findMany({
        where: {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { email: { contains: q } },
            { phone: { contains: q } },
          ],
        },
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      }),

      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { sku: { contains: q } },
            { barcode: { contains: q } },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          sku: true,
          salePrice: true,
          isActive: true,
        },
      }),

      prisma.order.findMany({
        where: {
          orderNumber: { contains: q },
        },
        take: limit,
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          createdAt: true,
          status: true,
        },
      }),

      prisma.employee.findMany({
        where: {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { position: { contains: q } },
          ],
        },
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          position: true,
          department: true,
        },
      }),

      prisma.supplier.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { contactName: { contains: q } },
            { email: { contains: q } },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          contactName: true,
          email: true,
        },
      }),
    ])

    const mappedCustomers = customers.map(c => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      email: c.email ?? '',
      phone: c.phone ?? '',
      type: 'customer' as const,
      href: `/customers/${c.id}`,
    }))

    const mappedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: p.salePrice,
      isActive: p.isActive,
      type: 'product' as const,
      href: `/products/${p.id}`,
    }))

    const mappedOrders = orders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      total: o.totalAmount,
      date: o.createdAt.toISOString(),
      status: o.status,
      type: 'order' as const,
      href: `/orders/${o.id}`,
    }))

    const mappedEmployees = employees.map(e => ({
      id: e.id,
      name: `${e.firstName} ${e.lastName}`,
      position: e.position,
      department: e.department ?? '',
      type: 'employee' as const,
      href: `/hr/employees/${e.id}`,
    }))

    const mappedSuppliers = suppliers.map(s => ({
      id: s.id,
      name: s.name,
      contactName: s.contactName ?? '',
      email: s.email ?? '',
      type: 'supplier' as const,
      href: `/purchasing/suppliers/${s.id}`,
    }))

    const totalCount =
      mappedCustomers.length +
      mappedProducts.length +
      mappedOrders.length +
      mappedEmployees.length +
      mappedSuppliers.length

    return NextResponse.json({
      query: q,
      results: {
        customers: mappedCustomers,
        products: mappedProducts,
        orders: mappedOrders,
        employees: mappedEmployees,
        suppliers: mappedSuppliers,
      },
      totalCount,
    })
  } catch (e) {
    console.error('[GET /api/search]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
