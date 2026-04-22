import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')
    const where: Record<string, unknown> = {}
    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status

    const requests = await prisma.fMLARequest.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: { employee: { select: { firstName: true, lastName: true } } },
    })
    return NextResponse.json(requests)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.employeeId || !body.fmlaReason || !body.startDate) {
      return NextResponse.json({ error: 'employeeId, fmlaReason, and startDate are required' }, { status: 400 })
    }

    const request = await prisma.fMLARequest.create({
      data: {
        employeeId: body.employeeId,
        requestType: body.requestType ?? 'continuous',
        fmlaReason: body.fmlaReason,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        hoursApproved: body.hoursApproved ?? null,
        certificationDue: body.certificationDue ? new Date(body.certificationDue) : null,
        notes: body.notes ?? null,
        status: 'pending',
      },
    })
    return NextResponse.json(request, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
