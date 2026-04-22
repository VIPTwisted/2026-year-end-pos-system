import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employeeId')

  const where = {
    ...(employeeId ? { employeeId } : {}),
    status: 'approved',
  }

  const registrations = await prisma.absenceRegistration.findMany({
    where,
    include: { code: true },
  })

  // Summarize by code
  const summaryMap = new Map<string, {
    codeId: string
    code: string
    description: string
    type: string
    isPaid: boolean
    totalDays: number
    totalHours: number
    count: number
  }>()

  for (const reg of registrations) {
    const key = reg.codeId
    const existing = summaryMap.get(key)
    if (existing) {
      existing.count++
      // @ts-ignore
      if (reg.unit === 'hours') existing.totalHours += reg.quantity
      // @ts-ignore
      else existing.totalDays += reg.quantity
    } else {
      summaryMap.set(key, {
        codeId: reg.codeId,
        code: reg.code.code,
        description: reg.code.description ?? '',
        type: reg.code.type,
        isPaid: reg.code.isPaid,
        // @ts-ignore
        totalDays: reg.unit === 'days' ? reg.quantity : 0,
        // @ts-ignore
        totalHours: reg.unit === 'hours' ? reg.quantity : 0,
        count: 1,
      })
    }
  }

  return NextResponse.json({
    employeeId,
    summary: Array.from(summaryMap.values()).sort((a, b) => b.totalDays - a.totalDays),
  })
}
