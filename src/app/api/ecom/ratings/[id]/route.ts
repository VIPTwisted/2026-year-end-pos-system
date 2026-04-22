import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const rating = await prisma.ecomRating.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.isVerified !== undefined && { isVerified: body.isVerified }),
      ...(body.helpfulCount !== undefined && { helpfulCount: body.helpfulCount }),
      ...(body.reviewerName !== undefined && { reviewerName: body.reviewerName }),
      ...(body.title !== undefined && { title: body.title }),
      ...(body.body !== undefined && { body: body.body }),
    },
  })
  return NextResponse.json(rating)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.ecomRating.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
