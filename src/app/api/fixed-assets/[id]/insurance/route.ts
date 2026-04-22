import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const policies = await prisma.fAInsurance.findMany({
    where: { assetId: id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(policies)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  if (!body.policyNo?.trim()) {
    return NextResponse.json({ error: 'policyNo is required' }, { status: 400 })
  }
  if (!body.insurerName?.trim()) {
    return NextResponse.json({ error: 'insurerName is required' }, { status: 400 })
  }

  const asset = await prisma.fixedAsset.findUnique({ where: { id } })
  if (!asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  const policy = await prisma.fAInsurance.create({
    data: {
      assetId: id,
      policyNo: body.policyNo.trim(),
      provider: body.insurerName.trim(),
      insurerName: body.insurerName.trim(),
      description: body.description ?? null,
      premium: typeof body.annualPremium === 'number' ? body.annualPremium : 0,
      coverage: typeof body.coverageAmount === 'number' ? body.coverageAmount : 0,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
  })

  return NextResponse.json(policy, { status: 201 })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  if (!body.insuranceId) {
    return NextResponse.json({ error: 'insuranceId is required' }, { status: 400 })
  }

  const policy = await prisma.fAInsurance.update({
    where: { id: body.insuranceId },
    data: {
      policyNo: body.policyNo ?? undefined,
      insurerName: body.insurerName ?? undefined,
      description: body.description ?? undefined,
      premium: body.annualPremium ?? undefined,
      coverage: body.coverageAmount ?? undefined,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    },
  })

  return NextResponse.json(policy)
}
