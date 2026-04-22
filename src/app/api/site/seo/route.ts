import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const configs = await prisma.siteSeoConfig.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(configs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  // Upsert by pageId if provided
  if (body.pageId) {
    const config = await prisma.siteSeoConfig.upsert({
      where: { pageId: body.pageId },
      update: body,
      create: body,
    })
    return NextResponse.json(config, { status: 200 })
  }
  const config = await prisma.siteSeoConfig.create({ data: body })
  return NextResponse.json(config, { status: 201 })
}
