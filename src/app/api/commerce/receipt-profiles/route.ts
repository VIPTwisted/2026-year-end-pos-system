import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const profiles = await prisma.receiptProfile.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(profiles)
  } catch (err) {
    console.error('[receipt-profiles GET]', err)
    return NextResponse.json({ error: 'Failed to fetch receipt profiles' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      profileId,
      name,
      receiptType,
      header,
      footer,
      showLogo = true,
      showBarcode = true,
      emailReceipt = false,
      printReceipt = true,
    } = body as {
      profileId: string
      name: string
      receiptType: string
      header?: string
      footer?: string
      showLogo?: boolean
      showBarcode?: boolean
      emailReceipt?: boolean
      printReceipt?: boolean
    }

    if (!profileId?.trim()) return NextResponse.json({ error: 'profileId is required' }, { status: 400 })
    if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    if (!receiptType?.trim()) return NextResponse.json({ error: 'receiptType is required' }, { status: 400 })

    const profile = await prisma.receiptProfile.create({
      data: {
        profileId: profileId.trim().toUpperCase(),
        name: name.trim(),
        receiptType,
        header: header || null,
        footer: footer || null,
        showLogo,
        showBarcode,
        emailReceipt,
        printReceipt,
      },
    })

    return NextResponse.json(profile, { status: 201 })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Profile ID already exists' }, { status: 409 })
    }
    console.error('[receipt-profiles POST]', err)
    return NextResponse.json({ error: 'Failed to create receipt profile' }, { status: 500 })
  }
}
