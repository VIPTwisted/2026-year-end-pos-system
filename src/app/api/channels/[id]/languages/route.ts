import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const languages = await prisma.channelLanguage.findMany({ where: { channelId: id } })
  return NextResponse.json(languages)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const lang = await prisma.channelLanguage.create({
    data: { channelId: id, languageCode: body.languageCode, languageName: body.languageName, isDefault: body.isDefault ?? false },
  })
  return NextResponse.json(lang, { status: 201 })
}
