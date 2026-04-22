import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { storeId, assignedTo } = body

  const list = await prisma.taskList.update({
    where: { id },
    data: {
      ...(storeId !== undefined ? { storeId } : {}),
      ...(assignedTo !== undefined ? { assignedTo } : {}),
    },
    include: { tasks: true },
  })

  return NextResponse.json(list)
}
