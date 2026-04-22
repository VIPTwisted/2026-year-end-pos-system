import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface ReceiptProfilePatch {
  name?: string
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const profile = await prisma.receiptProfile.findUnique({
      where: { id },
      include: { registers: { select: { id: true, name: true, registerId: true } } },
    })
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(profile)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch receipt profile' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: ReceiptProfilePatch = await req.json()
    const profile = await prisma.receiptProfile.update({ where: { id }, data: body })
    return NextResponse.json(profile)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update receipt profile' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const linked = await prisma.posRegister.count({ where: { receiptProfileId: id } })
    if (linked > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${linked} register(s) are linked to this profile` },
        { status: 409 }
      )
    }
    await prisma.receiptProfile.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete receipt profile' }, { status: 500 })
  }
}
