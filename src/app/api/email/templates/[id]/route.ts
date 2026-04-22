import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const template = await prisma.emailTemplate.findUnique({ where: { id } })
  if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(template)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const template = await prisma.emailTemplate.update({ where: { id }, data: body })
  return NextResponse.json(template)
}
