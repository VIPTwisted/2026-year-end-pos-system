import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const customerId = sp.get('customerId') ?? undefined
    const status     = sp.get('status')     ?? undefined
    const priority   = sp.get('priority')   ?? undefined

    const cases = await prisma.serviceCase.findMany({
      where: {
        ...(customerId ? { customerId } : {}),
        ...(status     ? { status }     : {}),
        ...(priority   ? { priority }   : {}),
      },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(cases)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      customerId: string
      subject: string
      description?: string
      priority?: string
      assignedToId?: string
    }

    const { customerId, subject, description, priority, assignedToId } = body

    if (!customerId || !subject) {
      return NextResponse.json({ error: 'customerId and subject are required' }, { status: 400 })
    }

    // Generate case number
    const count = await prisma.serviceCase.count()
    const caseNumber = `CASE-${String(count + 1).padStart(5, '0')}`

    const serviceCase = await prisma.serviceCase.create({
      data: {
        caseNumber,
        customerId,
        title: subject,
        description: description ?? null,
        priority: priority ?? 'normal',
        status: 'open',
        assignedTo: assignedToId ?? null,
      },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    })

    return NextResponse.json(serviceCase, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
