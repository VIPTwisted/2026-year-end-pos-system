import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const languages = await prisma.language.findMany({ orderBy: { code: 'asc' } })
  return NextResponse.json(languages)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { code, name, nativeName, rtl, isDefault } = body
  if (!code || !name || !nativeName) {
    return NextResponse.json({ error: 'code, name, nativeName required' }, { status: 400 })
  }
  if (isDefault) {
    await prisma.language.updateMany({ where: { isDefault: true }, data: { isDefault: false } })
  }
  const language = await prisma.language.create({
    data: {
      code: code.toLowerCase(),
      name,
      nativeName,
      rtl: rtl ?? false,
      isDefault: isDefault ?? false,
      isActive: true,
    },
  })
  return NextResponse.json(language, { status: 201 })
}
