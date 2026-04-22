import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface FunctionalityProfileBody {
  name: string
  description?: string
  country?: string
  currency?: string
  taxIncludedInPrice?: boolean
  priceCheckAllowed?: boolean
  priceOverrideAllowed?: boolean
  maxPriceOverridePct?: number
  manualDiscountAllowed?: boolean
  maxManualDiscountPct?: number
  voidRequiresManager?: boolean
  refundAllowed?: boolean
  maxRefundAmount?: number
  offlineModeAllowed?: boolean
  offlineMaxDays?: number
  itemSearchAllowed?: boolean
  customerSearchAllowed?: boolean
  inventoryLookupAllowed?: boolean
  loyaltyAllowed?: boolean
  giftCardAllowed?: boolean
  splitTenderAllowed?: boolean
  maxTendersPerTx?: number
  ageVerificationRequired?: boolean
  defaultAge?: number
  taxExemptAllowed?: boolean
  requireCustomerForReturn?: boolean
  isActive?: boolean
}

export async function GET() {
  try {
    const profiles = await prisma.functionalityProfile.findMany({
      include: { registers: { select: { id: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(profiles)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch functionality profiles' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: FunctionalityProfileBody = await req.json()
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    const profile = await prisma.functionalityProfile.create({ data: body })
    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create functionality profile' }, { status: 500 })
  }
}
