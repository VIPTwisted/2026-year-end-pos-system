import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest) {
  const exports = await prisma.cIExport.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(exports)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const exp = await prisma.cIExport.create({
    data: {
      exportName: body.exportName,
      destination: body.destination ?? '',
      destinationType: body.destinationType ?? 'csv',
      segmentId: body.segmentId ?? null,
      segmentName: body.segmentName ?? null,
      status: body.status ?? 'inactive',
      configJson: body.configJson ?? null,
      scheduleJson: body.scheduleJson ?? null,
    },
  })
  return NextResponse.json(exp, { status: 201 })
}
