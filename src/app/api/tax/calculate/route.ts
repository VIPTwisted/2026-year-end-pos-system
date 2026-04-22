import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { stateCode, subtotal, taxGroupId } = body

  const nexus = await prisma.taxNexus.findUnique({ where: { stateCode } })
  if (!nexus?.hasNexus) {
    return NextResponse.json({ totalTax: 0, effectiveRate: 0, breakdown: [] })
  }

  const components = await prisma.taxComponent.findMany({
    where: { taxGroupId, OR: [{ stateCode }, { stateCode: null }] },
  })

  let totalTax = 0
  const breakdown = components.map((c) => {
    const tax = subtotal * (c.rate / 100)
    totalTax += tax
    return { name: c.componentName, rate: c.rate, tax: parseFloat(tax.toFixed(2)) }
  })

  const effectiveRate = subtotal > 0 ? (totalTax / subtotal) * 100 : 0

  return NextResponse.json({
    totalTax: parseFloat(totalTax.toFixed(2)),
    effectiveRate: parseFloat(effectiveRate.toFixed(4)),
    breakdown,
  })
}
