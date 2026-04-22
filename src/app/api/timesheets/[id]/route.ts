import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sheet = await prisma.timeSheet.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, projectNo: true, description: true } },
      lines: {
        include: {
          resource: { select: { id: true, resourceNo: true, name: true } },
        },
        orderBy: { date: 'asc' },
      },
    },
  })
  if (!sheet) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(sheet)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { status } = body

    const valid = ['open', 'submitted', 'approved', 'rejected']
    if (status && !valid.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const sheet = await prisma.timeSheet.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
      },
    })
    return NextResponse.json(sheet)
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
