import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.sMTPProfile.updateMany({ data: { isDefault: false } })
  const profile = await prisma.sMTPProfile.update({ where: { id }, data: { isDefault: true } })
  return NextResponse.json(profile)
}
