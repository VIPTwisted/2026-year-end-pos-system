import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateTrackingCode(affiliateCode: string): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${affiliateCode}-${rand}`
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const links = await prisma.affiliateLink.findMany({
    where: { affiliateId: id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(links)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const affiliate = await prisma.affiliate.findUnique({ where: { id } })
  if (!affiliate) return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 })

  let code = generateTrackingCode(affiliate.affiliateCode)
  let exists = await prisma.affiliateLink.findUnique({ where: { trackingCode: code } })
  while (exists) {
    code = generateTrackingCode(affiliate.affiliateCode)
    exists = await prisma.affiliateLink.findUnique({ where: { trackingCode: code } })
  }

  const link = await prisma.affiliateLink.create({
    data: {
      affiliateId: id,
      name: body.name ?? null,
      destinationUrl: body.destinationUrl,
      trackingCode: code,
    },
  })
  return NextResponse.json(link, { status: 201 })
}
