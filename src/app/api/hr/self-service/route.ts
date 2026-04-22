import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employeeId')
  const status = searchParams.get('status')

  const requests = await prisma.selfServiceRequest.findMany({
    where: {
      ...(employeeId ? { employeeId } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(requests)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { employeeId, requestType, details, attachmentUrl } = body

  if (!employeeId || !requestType) {
    return NextResponse.json({ error: 'employeeId and requestType are required' }, { status: 400 })
  }

  const request = await prisma.selfServiceRequest.create({
    data: {
      employeeId,
      requestType,
      details: details ?? null,
      attachmentUrl: attachmentUrl ?? null,
    },
  })
  return NextResponse.json(request, { status: 201 })
}
