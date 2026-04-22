import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const profiles = await prisma.receiptProfile.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(profiles)
}

export async function POST(req: Request) {
  const body = await req.json()
  const profile = await prisma.receiptProfile.create({
    data: {
      profileId: body.profileId,
      profileName: body.profileName,
      headerLines: body.headerLines,
      footerLines: body.footerLines,
      showBarcode: body.showBarcode ?? true,
      barcodeType: body.barcodeType ?? 'Code128',
    },
  })
  return NextResponse.json(profile, { status: 201 })
}
