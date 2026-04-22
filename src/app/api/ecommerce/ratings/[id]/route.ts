import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const allowed = ['isApproved', 'isVerified', 'title', 'body', 'rating']
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))
  const rating = await prisma.productRating.update({ where: { id }, data })
  return NextResponse.json(rating)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.productRating.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
