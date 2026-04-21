import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const suppliers = await prisma.supplier.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      contactName: true,
      email: true,
      phone: true,
      paymentTerms: true,
    },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(suppliers)
}
