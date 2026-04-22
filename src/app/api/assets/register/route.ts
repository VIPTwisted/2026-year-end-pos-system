import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? undefined
    const groupId = searchParams.get('groupId') ?? undefined

    const assets = await prisma.fixedAsset.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(groupId ? { groupId } : {}),
      },
      include: {
        group: true,
        depreciationLines: {
          orderBy: [{ fiscalYear: 'desc' }, { periodNumber: 'desc' }],
        },
      },
      orderBy: { assetNumber: 'asc' },
    })

    const groups = await prisma.fixedAssetGroup.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ assets, groups })
  } catch (err) {
    console.error('[assets/register GET]', err)
    return NextResponse.json({ error: 'Failed to load asset register' }, { status: 500 })
  }
}
