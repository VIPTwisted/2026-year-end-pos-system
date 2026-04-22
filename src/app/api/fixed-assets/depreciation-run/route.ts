import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function calcDepreciation(
  method: string,
  acquisitionCost: number,
  salvageValue: number,
  noOfYears: number,
  bookValue: number,
  depreciationStartDate: Date | null,
  postingDate: Date
): number {
  const depreciableAmount = acquisitionCost - salvageValue
  if (depreciableAmount <= 0 || bookValue <= salvageValue) return 0

  const totalMonths = noOfYears * 12

  if (method === 'straight_line') {
    const monthlyAmount = depreciableAmount / totalMonths
    return Math.min(monthlyAmount, bookValue - salvageValue)
  }

  if (method === 'declining_balance') {
    const annualRate = 2 / noOfYears
    const monthlyAmount = (bookValue * annualRate) / 12
    return Math.min(monthlyAmount, bookValue - salvageValue)
  }

  if (method === 'sum_of_years') {
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

  return 0
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const postingDate = body.postingDate ? new Date(body.postingDate) : new Date()
  const bookCode: string = body.bookCode ?? 'COMPANY'

  // Find all active assets with an active depreciation book for this bookCode
  const assets = await prisma.fixedAsset.findMany({
    where: { status: 'active' },
    include: {
      depreciationBooks: {
        where: { bookCode, isActive: true },
      },
    },
  })

  const postingMonth = postingDate.getMonth()
  const postingYear = postingDate.getFullYear()

  const toProcess = assets.filter(a => {
    const book = a.depreciationBooks[0]
    if (!book) return false
    if (!book.lastDepreciationDate) return true
    const last = new Date(book.lastDepreciationDate)
    // Skip if already depreciated this month
    return !(last.getMonth() === postingMonth && last.getFullYear() === postingYear)
  })

  const entries: Array<{
    assetId: string
    description: string
    assetNumber: string
    amount: number
    newBookValue: number
  }> = []

  for (const asset of toProcess) {
    const book = asset.depreciationBooks[0]
    const amount = calcDepreciation(
      book.depreciationMethod,
      asset.acquisitionCost,
      asset.salvageValue,
      book.noOfDepreciationYears,
      book.bookValue,
      book.depreciationStartDate,
      postingDate
    )
    if (amount <= 0) continue
    entries.push({
      assetId: asset.id,
      assetNumber: asset.assetNumber,
      description: asset.description ?? '',
      amount,
      newBookValue: book.bookValue - amount,
    })
  }

  if (entries.length === 0) {
    return NextResponse.json({
      processed: 0,
      totalDepreciation: 0,
      entries: [],
      message: 'No assets require depreciation for this period',
    })
  }

  // Batch create entries + update books in a transaction
  await prisma.$transaction([
    prisma.fALedgerEntry.createMany({
      data: entries.map(e => ({
        assetId: e.assetId,
        entryType: 'depreciation',
        amount: -e.amount,
        description: `Batch depreciation run`,
        postingDate,
        depreciationBookCode: bookCode,
      })),
    }),
    ...entries.map(e => {
      const asset = toProcess.find(a => a.id === e.assetId)!
      const book = asset.depreciationBooks[0]
      return prisma.fADepreciationBook.update({
        where: { id: book.id },
        data: {
          bookValue: e.newBookValue,
          accumulatedDepreciation: book.accumulatedDepreciation + e.amount,
          lastDepreciationDate: postingDate,
        },
      })
    }),
  ])

  const totalDepreciation = entries.reduce((s, e) => s + e.amount, 0)

  return NextResponse.json({
    processed: entries.length,
    totalDepreciation,
    entries: entries.map(e => ({
      assetNumber: e.assetNumber,
      description: e.description,
      depreciationAmount: e.amount,
      newBookValue: e.newBookValue,
    })),
  })
}
