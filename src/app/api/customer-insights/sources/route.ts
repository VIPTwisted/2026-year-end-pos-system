import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest) {
  const sources = await prisma.cIDataSource.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(sources)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const source = await prisma.cIDataSource.create({
    data: {
      sourceName: body.sourceName,
      sourceType: body.sourceType ?? 'file',
      connectionType: body.connectionType ?? 'file',
      connectionInfo: body.connectionInfo ?? null,
      status: body.status ?? 'inactive',
      entityName: body.entityName ?? null,
      refreshMode: body.refreshMode ?? 'manual',
      notes: body.notes ?? null,
    },
  })
  return NextResponse.json(source, { status: 201 })
}
