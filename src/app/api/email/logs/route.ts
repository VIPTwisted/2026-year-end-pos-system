import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const logs = await prisma.emailLog.findMany({
    where: status ? { status } : {},
    orderBy: { sentAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(logs)
}
