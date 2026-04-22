import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        include: { items: true, store: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      arInvoices: { orderBy: { dueDate: 'desc' }, take: 5 },
    },
  })
  if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(customer)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const allowed = ['firstName','lastName','email','phone','address','city','state','zip','notes','tags','creditLimit','creditStatus','isActive','customerGroupId']
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))
  const customer = await prisma.customer.update({ where: { id }, data })
  return NextResponse.json(customer)
}
