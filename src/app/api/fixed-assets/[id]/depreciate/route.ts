import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function calcDepreciation(
  method: string,
  acquisitionCost: number,
  salvageValue: number,
  noOfYears: number,
  bookValue: number,
  accumulatedDepreciation: number,
  depreciationStartDate: Date | null,
  postingDate: Date
): number {
  const depreciableAmount = acquisitionCost - salvageValue
  if (depreciableAmount <= 0 || bookValue <= salvageValue) return 0

  const totalMonths = noOfYears * 12

  if (method === 'straight_line') {
    // Monthly straight-line
    const monthlyAmount = depreciableAmount / totalMonths
    return Math.min(monthlyAmount, bookValue - salvageValue)
  }

  if (method === 'declining_balance') {
    // Double-declining: annual rate = 2 / years, monthly = annual / 12
    const annualRate = 2 / noOfYears
    const monthlyAmount = (bookValue * annualRate) / 12
    return Math.min(monthlyAmount, bookValue - salvageValue)
  }

  if (method === 'sum_of_years') {
    // Approximate: determine months elapsed
    const startDate = depreciationStartDate || new Date(postingDate)
    const monthsElapsed = Math.max(0,
      (postingDate.getFullYear() - startDate.getFullYear()) * 12 +
      (postingDate.getMonth() - startDate.getMonth())
    )
    const remainingMonths = totalMonths - monthsElapsed
    if (remainingMonths <= 0) return 0
    const sumMonths = (totalMonths * (totalMonths + 1)) / 2
    const monthlyAmount = (depreciableAmount * remainingMonths) / sumMonths
    return Math.min(monthlyAmount, bookValue - salvageValue)
  }

  if (method === 'units_of_production' || method === 'manual') {
    return 0 // requires external input
  }

  return 0
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const postingDate = body.postingDate ? new Date(body.postingDate) : new Date()
  const bookCode: string = body.bookCode ?? 'COMPANY'

  const asset = await prisma.fixedAsset.findUnique({
    where: { id },
    include: { depreciationBooks: { where: { bookCode, isActive: true } } },
  })

  if (!asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }
  if (asset.status !== 'active') {
    return NextResponse.json({ error: 'Asset is not active' }, { status: 400 })
  }

  const book = asset.depreciationBooks[0]
  if (!book) {
    return NextResponse.json(
      { error: `No active depreciation book found for code "${bookCode}"` },
      { status: 404 }
    )
  }

  const amount = calcDepreciation(
    book.depreciationMethod,
    asset.acquisitionCost,
    asset.salvageValue,
    book.noOfDepreciationYears,
    book.bookValue,
    book.accumulatedDepreciation,
    book.depreciationStartDate,
    postingDate
  )

  if (amount <= 0) {
    return NextResponse.json({ error: 'No depreciation to post — asset may be fully depreciated' }, { status: 400 })
  }

  const newBookValue = book.bookValue - amount
  const newAccum = book.accumulatedDepreciation + amount

  const [entry] = await prisma.$transaction([
    prisma.fALedgerEntry.create({
      data: {
        assetId: id,
        entryType: 'depreciation',
        amount: -amount,
        description: `Depreciation — ${book.depreciationMethod}`,
        postingDate,
        depreciationBookCode: bookCode,
      },
    }),
    prisma.fADepreciationBook.update({
      where: { id: book.id },
      data: {
        bookValue: newBookValue,
        accumulatedDepreciation: newAccum,
        lastDepreciationDate: postingDate,
      },
    }),
  ])

  return NextResponse.json({
    amount,
    newBookValue,
    newAccumulatedDepreciation: newAccum,
    entryId: entry.id,
  })
}
