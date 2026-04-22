import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const disposalDate = body.disposalDate ? new Date(body.disposalDate) : new Date()
  const saleAmount: number = typeof body.saleAmount === 'number' ? body.saleAmount : 0
  const description: string = body.description ?? 'Asset disposal'

  const asset = await prisma.fixedAsset.findUnique({
    where: { id },
    include: { depreciationBooks: { where: { isActive: true }, take: 1 } },
  })

  if (!asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }
  if (asset.status !== 'active') {
    return NextResponse.json({ error: 'Asset is not active' }, { status: 400 })
  }

  const book = asset.depreciationBooks[0]
  const currentBookValue = book ? book.bookValue : asset.acquisitionCost

  const entries: Array<{
    assetId: string
    entryType: string
    amount: number
    description: string
    postingDate: Date
    depreciationBookCode: string
  }> = []

  // Disposal entry (sale proceeds)
  entries.push({
    assetId: id,
    entryType: 'disposal',
    amount: saleAmount,
    description,
    postingDate: disposalDate,
    depreciationBookCode: book?.bookCode ?? 'COMPANY',
  })

  const gain = saleAmount - currentBookValue
  if (gain > 0) {
    entries.push({
      assetId: id,
      entryType: 'appreciation',
      amount: gain,
      description: `Gain on disposal`,
      postingDate: disposalDate,
      depreciationBookCode: book?.bookCode ?? 'COMPANY',
    })
  } else if (gain < 0) {
    entries.push({
      assetId: id,
      entryType: 'write_down',
      amount: gain, // negative
      description: `Loss on disposal`,
      postingDate: disposalDate,
      depreciationBookCode: book?.bookCode ?? 'COMPANY',
    })
  }

  await prisma.$transaction([
    ...entries.map(e => prisma.fALedgerEntry.create({ data: e })),
    prisma.fixedAsset.update({
      where: { id },
      data: { status: 'disposed' },
    }),
  ])

  return NextResponse.json({
    saleAmount,
    currentBookValue,
    gain,
    entries: entries.length,
  })
}
