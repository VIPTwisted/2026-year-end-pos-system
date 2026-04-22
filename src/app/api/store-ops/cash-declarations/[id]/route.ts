import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const decl = await prisma.cashDeclaration.findUnique({ where: { id } })
  if (!decl) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(decl)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  return NextResponse.json(await prisma.cashDeclaration.update({ where: { id }, data: body }))
}
