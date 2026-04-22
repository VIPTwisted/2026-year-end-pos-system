import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface ReceiptProfileBody {
  name: string
  headerLine1?: string
  headerLine2?: string
  headerLine3?: string
  footerLine1?: string
  footerLine2?: string
  footerLine3?: string
  showLogo?: boolean
  logoUrl?: string
  showStoreName?: boolean
  showStoreAddress?: boolean
  showStorePhone?: boolean
  showCashier?: boolean
  showOrderNumber?: boolean
  showDateTime?: boolean
  showBarcode?: boolean
  showQrCode?: boolean
  showTaxDetail?: boolean
  showLoyaltyBalance?: boolean
  showReturnPolicy?: boolean
  returnPolicyText?: string
  paperWidth?: number
  fontSize?: string
  isDefault?: boolean
}

export async function GET() {
  try {
    const profiles = await prisma.receiptProfile.findMany({
      include: { registers: { select: { id: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(profiles)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch receipt profiles' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ReceiptProfileBody = await req.json()
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    const profile = await prisma.receiptProfile.create({ data: body })
    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create receipt profile' }, { status: 500 })
  }
}
