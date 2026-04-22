import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface FunctionalityProfilePatch {
  name?: string
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const profile = await prisma.functionalityProfile.findUnique({
      where: { id },
      include: { registers: { select: { id: true, name: true, registerId: true } } },
    })
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(profile)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch functionality profile' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: FunctionalityProfilePatch = await req.json()
    const profile = await prisma.functionalityProfile.update({ where: { id }, data: body })
    return NextResponse.json(profile)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update functionality profile' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const linked = await prisma.posRegister.count({ where: { functionalityProfileId: id } })
    if (linked > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${linked} register(s) are linked to this profile` },
        { status: 409 }
      )
    }
    await prisma.functionalityProfile.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete functionality profile' }, { status: 500 })
  }
}
