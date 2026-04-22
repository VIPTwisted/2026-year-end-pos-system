import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const VARIANTS_A100 = [
  { variantNo: 'A100-RED-S', color: 'Red',    size: 'Small',  style: 'Standard', status: 'Active',       onHand: 45,  unitCost: 22.00, salesPrice: 34.99 },
  { variantNo: 'A100-RED-M', color: 'Red',    size: 'Medium', style: 'Standard', status: 'Active',       onHand: 38,  unitCost: 22.50, salesPrice: 34.99 },
  { variantNo: 'A100-RED-L', color: 'Red',    size: 'Large',  style: 'Standard', status: 'Active',       onHand: 12,  unitCost: 23.00, salesPrice: 36.99 },
  { variantNo: 'A100-BLU-S', color: 'Blue',   size: 'Small',  style: 'Standard', status: 'Active',       onHand: 67,  unitCost: 22.00, salesPrice: 34.99 },
  { variantNo: 'A100-BLU-M', color: 'Blue',   size: 'Medium', style: 'Standard', status: 'Active',       onHand: 54,  unitCost: 22.50, salesPrice: 34.99 },
  { variantNo: 'A100-BLU-L', color: 'Blue',   size: 'Large',  style: 'Standard', status: 'Active',       onHand: 23,  unitCost: 23.00, salesPrice: 36.99 },
  { variantNo: 'A100-BLK-S', color: 'Black',  size: 'Small',  style: 'Standard', status: 'Active',       onHand: 89,  unitCost: 22.00, salesPrice: 34.99 },
  { variantNo: 'A100-BLK-M', color: 'Black',  size: 'Medium', style: 'Standard', status: 'Active',       onHand: 71,  unitCost: 22.50, salesPrice: 34.99 },
  { variantNo: 'A100-BLK-L', color: 'Black',  size: 'Large',  style: 'Standard', status: 'Active',       onHand: 30,  unitCost: 23.00, salesPrice: 36.99 },
  { variantNo: 'A100-SLV-S', color: 'Silver', size: 'Small',  style: 'Standard', status: 'Discontinued', onHand: 5,   unitCost: 22.00, salesPrice: 32.99 },
  { variantNo: 'A100-SLV-M', color: 'Silver', size: 'Medium', style: 'Standard', status: 'Discontinued', onHand: 3,   unitCost: 22.50, salesPrice: 32.99 },
  { variantNo: 'A100-SLV-L', color: 'Silver', size: 'Large',  style: 'Standard', status: 'Discontinued', onHand: 0,   unitCost: 23.00, salesPrice: 34.99 },
]

const VARIANTS_MAP: Record<string, typeof VARIANTS_A100> = {
  A100: VARIANTS_A100,
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId') ?? 'A100'
  const variants = VARIANTS_MAP[productId] ?? VARIANTS_A100

  return NextResponse.json({
    productId,
    total: variants.length,
    variants,
  })
}
