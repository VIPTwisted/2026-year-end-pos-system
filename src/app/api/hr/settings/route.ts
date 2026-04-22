import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const rows = await prisma.hRSettings.findMany()
  const map: Record<string, string> = {}
  for (const r of rows) map[r.key] = r.value
  return NextResponse.json(map)
}

export async function POST(req: NextRequest) {
  const body = await req.json() as Record<string, string>
  const upserts = Object.entries(body).map(([key, value]) =>
    prisma.hRSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  )
  await Promise.all(upserts)
  return NextResponse.json({ ok: true })
}
