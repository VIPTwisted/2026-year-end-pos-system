import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ALL_STATES = [
  { stateCode: 'AL', stateName: 'Alabama' },
  { stateCode: 'AK', stateName: 'Alaska' },
  { stateCode: 'AZ', stateName: 'Arizona' },
  { stateCode: 'AR', stateName: 'Arkansas' },
  { stateCode: 'CA', stateName: 'California' },
  { stateCode: 'CO', stateName: 'Colorado' },
  { stateCode: 'CT', stateName: 'Connecticut' },
  { stateCode: 'DE', stateName: 'Delaware' },
  { stateCode: 'FL', stateName: 'Florida' },
  { stateCode: 'GA', stateName: 'Georgia' },
  { stateCode: 'HI', stateName: 'Hawaii' },
  { stateCode: 'ID', stateName: 'Idaho' },
  { stateCode: 'IL', stateName: 'Illinois' },
  { stateCode: 'IN', stateName: 'Indiana' },
  { stateCode: 'IA', stateName: 'Iowa' },
  { stateCode: 'KS', stateName: 'Kansas' },
  { stateCode: 'KY', stateName: 'Kentucky' },
  { stateCode: 'LA', stateName: 'Louisiana' },
  { stateCode: 'ME', stateName: 'Maine' },
  { stateCode: 'MD', stateName: 'Maryland' },
  { stateCode: 'MA', stateName: 'Massachusetts' },
  { stateCode: 'MI', stateName: 'Michigan' },
  { stateCode: 'MN', stateName: 'Minnesota' },
  { stateCode: 'MS', stateName: 'Mississippi' },
  { stateCode: 'MO', stateName: 'Missouri' },
  { stateCode: 'MT', stateName: 'Montana' },
  { stateCode: 'NE', stateName: 'Nebraska' },
  { stateCode: 'NV', stateName: 'Nevada' },
  { stateCode: 'NH', stateName: 'New Hampshire' },
  { stateCode: 'NJ', stateName: 'New Jersey' },
  { stateCode: 'NM', stateName: 'New Mexico' },
  { stateCode: 'NY', stateName: 'New York' },
  { stateCode: 'NC', stateName: 'North Carolina' },
  { stateCode: 'ND', stateName: 'North Dakota' },
  { stateCode: 'OH', stateName: 'Ohio' },
  { stateCode: 'OK', stateName: 'Oklahoma' },
  { stateCode: 'OR', stateName: 'Oregon' },
  { stateCode: 'PA', stateName: 'Pennsylvania' },
  { stateCode: 'RI', stateName: 'Rhode Island' },
  { stateCode: 'SC', stateName: 'South Carolina' },
  { stateCode: 'SD', stateName: 'South Dakota' },
  { stateCode: 'TN', stateName: 'Tennessee' },
  { stateCode: 'TX', stateName: 'Texas' },
  { stateCode: 'UT', stateName: 'Utah' },
  { stateCode: 'VT', stateName: 'Vermont' },
  { stateCode: 'VA', stateName: 'Virginia' },
  { stateCode: 'WA', stateName: 'Washington' },
  { stateCode: 'WV', stateName: 'West Virginia' },
  { stateCode: 'WI', stateName: 'Wisconsin' },
  { stateCode: 'WY', stateName: 'Wyoming' },
]

export async function GET() {
  const existing = await prisma.taxNexus.findMany({ orderBy: { stateCode: 'asc' } })
  const existingCodes = new Set(existing.map((n) => n.stateCode))
  const missing = ALL_STATES.filter((s) => !existingCodes.has(s.stateCode))
  if (missing.length > 0) {
    await prisma.taxNexus.createMany({
      data: missing.map((s) => ({ stateCode: s.stateCode, stateName: s.stateName })),
    })
  }
  const nexus = await prisma.taxNexus.findMany({ orderBy: { stateCode: 'asc' } })
  return NextResponse.json(nexus)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const nexus = await prisma.taxNexus.create({
    data: {
      stateCode: body.stateCode,
      stateName: body.stateName,
      hasNexus: body.hasNexus ?? false,
      nexusType: body.nexusType ?? null,
      thresholdAmt: body.thresholdAmt ?? null,
      registrationNumber: body.registrationNumber ?? null,
      effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : null,
      notes: body.notes ?? null,
    },
  })
  return NextResponse.json(nexus, { status: 201 })
}
