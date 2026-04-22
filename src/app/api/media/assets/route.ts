import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const folder = searchParams.get('folder')
  const fileType = searchParams.get('fileType')
  const assets = await prisma.mediaAsset.findMany({
    where: {
      ...(folder ? { folder } : {}),
      ...(fileType ? { fileType } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(assets)
}

export async function POST(req: Request) {
  const body = await req.json()
  const asset = await prisma.mediaAsset.create({
    data: {
      assetId: `asset-${Date.now()}`,
      fileName: body.fileName,
      fileType: body.fileType,
      url: body.url,
      altText: body.altText,
      tags: body.tags,
      folder: body.folder ?? '/',
      isPublished: body.isPublished ?? true,
    },
  })
  return NextResponse.json(asset, { status: 201 })
}
