import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [total, sent, failed, opened] = await Promise.all([
    prisma.emailLog.count(),
    prisma.emailLog.count({ where: { status: 'sent' } }),
    prisma.emailLog.count({ where: { status: 'failed' } }),
    prisma.emailLog.count({ where: { openedAt: { not: null } } }),
  ])
  return NextResponse.json({
    total,
    sent,
    failed,
    opened,
    openRate: total > 0 ? ((opened / total) * 100).toFixed(1) : '0.0',
    deliveryRate: total > 0 ? (((total - failed) / total) * 100).toFixed(1) : '0.0',
  })
}
