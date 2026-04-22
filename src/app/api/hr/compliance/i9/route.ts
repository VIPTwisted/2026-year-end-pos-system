import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const records = await prisma.i9Verification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { employee: { select: { firstName: true, lastName: true } } },
    })
    return NextResponse.json(records)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.employeeId || !body.hireDate) {
      return NextResponse.json({ error: 'employeeId and hireDate are required' }, { status: 400 })
    }

    // Determine initial status
    const hasSection1 = !!body.section1Date
    const hasSection2 = !!body.section2Date
    const hasDocs = !!body.listADoc || (!!body.listBDoc && !!body.listCDoc)
    let status = 'pending'
    if (hasSection1 && hasSection2 && hasDocs) status = 'complete'

    const record = await prisma.i9Verification.create({
      data: {
        employeeId: body.employeeId,
        hireDate: new Date(body.hireDate),
        section1Date: body.section1Date ? new Date(body.section1Date) : null,
        section2Date: body.section2Date ? new Date(body.section2Date) : null,
        listADoc: body.listADoc ?? null,
        listBDoc: body.listBDoc ?? null,
        listCDoc: body.listCDoc ?? null,
        expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
        notes: body.notes ?? null,
        status,
      },
    })
    return NextResponse.json(record, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
