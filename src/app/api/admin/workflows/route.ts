import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const workflows = await prisma.adminWorkflow.findMany({
    include: { steps: { orderBy: { stepNo: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(workflows)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { steps, ...wfData } = body
  const wf = await prisma.adminWorkflow.create({
    data: {
      ...wfData,
      steps: steps?.length ? { create: steps } : undefined,
    },
    include: { steps: { orderBy: { stepNo: 'asc' } } },
  })
  return NextResponse.json(wf, { status: 201 })
}
