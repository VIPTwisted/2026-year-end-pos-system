import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const customerId = searchParams.get('customerId')
  const search = searchParams.get('search')

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (customerId) where.customerId = customerId
  if (search) {
    where.OR = [
      { projectNo: { contains: search } },
      { description: { contains: search } },
    ]
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      customer: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { tasks: true, ledgerEntries: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { description, customerId, startDate, endDate, dueDate, contractAmount, budgetAmount, wipMethod, notes } = body

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    // Auto-number: PROJ-YYYY-NNNN
    const year = new Date().getFullYear()
    const prefix = `PROJ-${year}-`
    const last = await prisma.project.findFirst({
      where: { projectNo: { startsWith: prefix } },
      orderBy: { projectNo: 'desc' },
    })
    const seq = last ? parseInt(last.projectNo.slice(prefix.length)) + 1 : 1
    const projectNo = `${prefix}${String(seq).padStart(4, '0')}`

    const project = await prisma.project.create({
      data: {
        projectNo,
        description: description.trim(),
        customerId: customerId || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        contractAmount: contractAmount ? parseFloat(contractAmount) : 0,
        budgetAmount: budgetAmount ? parseFloat(budgetAmount) : 0,
        wipMethod: wipMethod || 'completed_contract',
        notes: notes?.trim() || null,
      },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
    })
    return NextResponse.json(project, { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
