import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { reason } = body

  const request = await prisma.leaveRequest.update({
    where: { id },
    data: {
      status: 'rejected',
      rejectionReason: reason,
    },
  })
  return NextResponse.json(request)
}
