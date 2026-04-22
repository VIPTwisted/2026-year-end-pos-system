import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const sitemaps = await prisma.siteMap.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(sitemaps)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const sitemap = await prisma.siteMap.create({ data: body })
  return NextResponse.json(sitemap, { status: 201 })
}
