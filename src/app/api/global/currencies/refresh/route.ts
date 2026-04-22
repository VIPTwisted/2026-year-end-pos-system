import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const rates = await prisma.exchangeRate.findMany({ where: { isActive: true } })
  let count = 0
  for (const rate of rates) {
    const variance = (Math.random() - 0.5) * 0.04 // ±2%
    const newRate = parseFloat((rate.rate * (1 + variance)).toFixed(6))
    await prisma.exchangeRate.update({
      where: { id: rate.id },
      data: { rate: newRate, effectiveDate: new Date() },
    })
    count++
  }
  return NextResponse.json({ updated: count, refreshedAt: new Date().toISOString() })
}
