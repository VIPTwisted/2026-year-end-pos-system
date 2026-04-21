import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  let body: { fiscalYear?: string; periodNumber?: number } = {}
  try {
    body = await req.json()
  } catch {
    // Allow empty body — default to current period
  }

  const now = new Date()
  const fiscalYear: string = body.fiscalYear ?? String(now.getFullYear())
  const periodNumber: number = body.periodNumber ?? now.getMonth() + 1

  if (!fiscalYear || periodNumber < 1 || periodNumber > 12) {
    return NextResponse.json(
      { error: 'Invalid fiscalYear or periodNumber (1–12)' },
      { status: 400 }
    )
  }

  // Fetch all active assets that have not yet had this period posted
  const activeAssets = await prisma.fixedAsset.findMany({
    where: { status: 'active' },
  })

  // Filter out any that already have an entry for this period
  const existingEntries = await prisma.assetDepreciation.findMany({
    where: {
      fiscalYear,
      periodNumber,
      assetId: { in: activeAssets.map(a => a.id) },
    },
    select: { assetId: true },
  })
  const alreadyPosted = new Set(existingEntries.map(e => e.assetId))

  const toProcess = activeAssets.filter(a => !alreadyPosted.has(a.id))

  if (toProcess.length === 0) {
    return NextResponse.json({
      processed: 0,
      totalDepreciation: 0,
      message: `All active assets already have depreciation posted for ${fiscalYear} period ${periodNumber}`,
    })
  }

  let processed = 0
  let totalDepreciation = 0

  await prisma.$transaction(async (tx) => {
    for (const asset of toProcess) {
      // Skip if already at salvage
      if (asset.currentBookValue <= asset.salvageValue) {
        // Mark as fully depreciated if not already
        if (asset.status === 'active') {
          await tx.fixedAsset.update({
            where: { id: asset.id },
            data: { status: 'fully_depreciated' },
          })
        }
        continue
      }

      const totalMonths = asset.usefulLifeYears * 12
      let depreciationAmount = 0

      if (asset.depreciationMethod === 'straight_line') {
        depreciationAmount = (asset.acquisitionCost - asset.salvageValue) / totalMonths
      } else if (asset.depreciationMethod === 'declining_balance') {
        depreciationAmount = asset.currentBookValue * (2 / totalMonths)
      } else if (asset.depreciationMethod === 'sum_of_years') {
        // Estimate remaining months from book value position
        const depreciableAmount = asset.acquisitionCost - asset.salvageValue
        const alreadyDepreciated = asset.accumulatedDeprec
        // Approximate remaining period from how much has been depreciated
        // Use linear approximation: figure months elapsed
        const monthsElapsed = depreciableAmount > 0
          ? Math.round((alreadyDepreciated / depreciableAmount) * totalMonths)
          : 0
        const remainingMonths = Math.max(1, totalMonths - monthsElapsed)
        const sumMonths = (totalMonths * (totalMonths + 1)) / 2
        depreciationAmount = (depreciableAmount * remainingMonths) / sumMonths
      }

      // Cap to not go below salvage value
      depreciationAmount = Math.min(depreciationAmount, asset.currentBookValue - asset.salvageValue)
      depreciationAmount = Math.max(0, depreciationAmount)

      if (depreciationAmount <= 0) continue

      const newBookValue = asset.currentBookValue - depreciationAmount
      const newAccumulated = asset.accumulatedDeprec + depreciationAmount
      const newStatus = newBookValue <= asset.salvageValue ? 'fully_depreciated' : 'active'

      // Create depreciation line
      await tx.assetDepreciation.create({
        data: {
          assetId: asset.id,
          fiscalYear,
          periodNumber,
          depreciationAmount,
          accumulatedDepreciation: newAccumulated,
          bookValueAfter: newBookValue,
          postedAt: now,
        },
      })

      // Update asset
      await tx.fixedAsset.update({
        where: { id: asset.id },
        data: {
          currentBookValue: newBookValue,
          accumulatedDeprec: newAccumulated,
          status: newStatus,
        },
      })

      processed++
      totalDepreciation += depreciationAmount
    }
  })

  return NextResponse.json({
    processed,
    totalDepreciation,
    fiscalYear,
    periodNumber,
    message: `Depreciation posted for ${processed} asset${processed !== 1 ? 's' : ''}`,
  })
}
