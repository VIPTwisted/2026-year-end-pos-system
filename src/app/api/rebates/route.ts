import { NextResponse } from 'next/server'

// TODO: Add RebateAgreement model to Prisma schema
// model RebateAgreement {
//   id             String   @id @default(cuid())
//   name           String
//   party          String
//   partyType      String   // vendor | customer
//   type           String   // vendor-funded | customer-earned
//   calcMethod     String   // pct_of_spend | fixed_per_unit | tiered_pct | flat_amount
//   rebatePct      Float    @default(0)
//   threshold      Float    @default(0)
//   thresholdsJson String?  // JSON: [{ qty, amount, rebatePct }]
//   accrued        Float    @default(0)
//   claimed        Float    @default(0)
//   status         String   @default("active")
//   validFrom      DateTime?
//   validTo        DateTime?
//   description    String?
//   createdAt      DateTime @default(now())
//   updatedAt      DateTime @updatedAt
// }

// Static mock data — replace with Prisma queries when model is added
const MOCK_REBATES = [
  {
    id: 'r001',
    name: 'Q2 Vendor Volume Rebate',
    party: 'Apex Electronics Inc.',
    partyType: 'vendor',
    type: 'vendor-funded',
    rebatePct: 3.5,
    threshold: 50000,
    accrued: 4312.50,
    status: 'active',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
  },
  {
    id: 'r002',
    name: 'Gold Customer Loyalty Rebate',
    party: 'MegaRetail Corp',
    partyType: 'customer',
    type: 'customer-earned',
    rebatePct: 2.0,
    threshold: 100000,
    accrued: 8750.00,
    status: 'active',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  },
  {
    id: 'r003',
    name: 'Seasonal Promo Rebate — Spring',
    party: 'FlexSupply Co.',
    partyType: 'vendor',
    type: 'vendor-funded',
    rebatePct: 5.0,
    threshold: 25000,
    accrued: 3125.00,
    status: 'active',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
  },
]

// GET /api/rebates
export async function GET() {
  return NextResponse.json(MOCK_REBATES)
}

// POST /api/rebates
// TODO: Replace mock response with prisma.rebateAgreement.create() once model exists
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, partyType, party, rebateType, calcMethod, thresholds, validFrom, validTo, description } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    // Stub: return mock created record until RebateAgreement model is added to schema
    const newRecord = {
      id:          `r${Date.now()}`,
      name:        name.trim(),
      party:       party ?? '',
      partyType:   partyType ?? 'vendor',
      type:        rebateType ?? 'vendor-funded',
      calcMethod:  calcMethod ?? 'pct_of_spend',
      thresholds:  thresholds ?? [],
      accrued:     0,
      status:      'pending',
      startDate:   validFrom ?? null,
      endDate:     validTo   ?? null,
      description: description ?? null,
    }

    return NextResponse.json(newRecord, { status: 201 })
  } catch (err) {
    console.error('[rebates POST]', err)
    return NextResponse.json({ error: 'Failed to create rebate agreement' }, { status: 500 })
  }
}
