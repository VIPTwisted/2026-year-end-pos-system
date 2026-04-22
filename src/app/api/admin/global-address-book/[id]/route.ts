import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const record = await prisma.globalAddressBook.findUnique({ where: { id: params.id } })
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(record)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const record = await prisma.globalAddressBook.update({ where: { id: params.id }, data: body })
  return NextResponse.json(record)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.globalAddressBook.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
