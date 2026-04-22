import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const summary = searchParams.get('summary') === 'true'

  const where = status ? { status } : {}

  const assets = await prisma.fixedAsset.findMany({
    where,
    include: {
      class: true,
      subclass: true,
      depreciationBooks: {
        where: { isActive: true },
        take: 1,
      },
    },
    orderBy: { assetNumber: 'asc' },
  })

  if (summary) {
    const totalAcquisitionCost = assets.reduce((s, a) => s + a.acquisitionCost, 0)
    const totalBookValue = assets.reduce((s, a) => {
      const book = a.depreciationBooks[0]
      return s + (book ? book.bookValue : a.acquisitionCost)
    }, 0)
    const totalAccumDeprec = assets.reduce((s, a) => {
      const book = a.depreciationBooks[0]
      return s + (book ? book.accumulatedDepreciation : 0)
    }, 0)
    return NextResponse.json({
      assets,
      summary: {
        totalAssets: assets.length,
        totalAcquisitionCost,
        totalBookValue,
        totalAccumDeprec,
      },
    })
  }

  return NextResponse.json(assets)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.description?.trim()) {
    return NextResponse.json({ error: 'description is required' }, { status: 400 })
  }

  // Auto-generate assetNumber FA-NNNNNN
  const count = await prisma.fixedAsset.count()
  const assetNumber = body.assetNumber?.trim() || `FA-${String(count + 1).padStart(6, '0')}`

  const existing = await prisma.fixedAsset.findUnique({ where: { assetNumber } })
  if (existing) {
    return NextResponse.json({ error: `Asset number "${assetNumber}" already in use` }, { status: 409 })
  }

  const acquisitionCost: number = typeof body.acquisitionCost === 'number' ? body.acquisitionCost : 0
  const salvageValue: number = typeof body.salvageValue === 'number' ? body.salvageValue : 0

  const asset = await prisma.fixedAsset.create({
    data: {
      assetNumber,
      description: body.description.trim(),
      classId: body.classId ?? null,
      subclassId: body.subclassId ?? null,
      status: 'active',
      serialNumber: body.serialNumber ?? null,
      location: body.location ?? null,
      responsibleEmployee: body.responsibleEmployee ?? null,
      acquisitionDate: body.acquisitionDate ? new Date(body.acquisitionDate) : null,
      acquisitionCost,
      salvageValue,
      notes: body.notes ?? null,
      depreciationBooks: body.depreciationMethod ? {
        create: {
          bookCode: body.bookCode ?? 'COMPANY',
          depreciationMethod: body.depreciationMethod ?? 'straight_line',
          depreciationStartDate: body.depreciationStartDate ? new Date(body.depreciationStartDate) : null,
          noOfDepreciationYears: body.noOfDepreciationYears ?? 5,
          bookValue: acquisitionCost,
          accumulatedDepreciation: 0,
        },
      } : undefined,
    },
    include: {
      class: true,
      subclass: true,
      depreciationBooks: true,
    },
  })

  return NextResponse.json(asset, { status: 201 })
}
