import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const wf = await prisma.adminWorkflow.findUnique({
    where: { id: params.id },
    include: { steps: { orderBy: { stepNo: 'asc' } } },
  })
  if (!wf) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(wf)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { steps, ...wfData } = body
  const wf = await prisma.adminWorkflow.update({
    where: { id: params.id },
    data: wfData,
    include: { steps: { orderBy: { stepNo: 'asc' } } },
  })
  return NextResponse.json(wf)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.adminWorkflow.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
