// Incoming Documents [id] — backed by VendorInvoice model
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const invoice = await prisma.vendorInvoice.findUnique({
    where: { id },
    include: {
      vendor: true,
      lines: true,
    },
  })
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(invoice)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const allowed: Record<string, unknown> = {}
  const patchableFields = ['status', 'matchingStatus', 'poId', 'journalEntryId', 'notes']
  for (const field of patchableFields) {
    if (field in body) allowed[field] = body[field]
  }

  const updated = await prisma.vendorInvoice.update({
    where: { id },
    data: allowed,
    include: {
      vendor: { select: { id: true, name: true } },
      lines: true,
    },
  })
  return NextResponse.json(updated)
}
