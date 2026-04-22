import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: Request, { params }: { params: Promise<{ id: string; langId: string }> }) {
  const { id, langId } = await params
  await prisma.channelLanguage.updateMany({ where: { channelId: id }, data: { isDefault: false } })
  const lang = await prisma.channelLanguage.update({ where: { id: langId }, data: { isDefault: true } })
  return NextResponse.json(lang)
}
