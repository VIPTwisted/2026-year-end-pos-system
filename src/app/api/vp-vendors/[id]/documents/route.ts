import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const docs = await prisma.vpVendorDocument.findMany({
    where: { vendorId: id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(docs)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  if (!body.name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const doc = await prisma.vpVendorDocument.create({
    data: {
      vendorId:  id,
      name:      body.name,
      docType:   body.docType ?? 'contract',
      url:       body.url ?? null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      status:    body.status ?? 'active',
    },
  })

  return NextResponse.json(doc, { status: 201 })
}
