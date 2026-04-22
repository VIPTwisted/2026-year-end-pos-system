import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const type   = searchParams.get('type')
  const search = searchParams.get('search')

  try {
    const assets = await prisma.enterpriseAsset.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(type   ? { assetType: type } : {}),
        ...(search ? {
          OR: [
            { assetId:   { contains: search } },
            { name:      { contains: search } },
            { location:  { contains: search } },
          ],
        } : {}),
      },
      orderBy: { assetId: 'asc' },
      take: 300,
    })
    return NextResponse.json(assets)
  } catch {
    return NextResponse.json({ error: 'Assets unavailable' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const asset = await prisma.enterpriseAsset.create({ data: body })
    return NextResponse.json(asset, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 })
  }
}
