import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') ?? 'gen-business'

  try {
    let data: unknown[]
    switch (type) {
      case 'gen-business':
        data = await prisma.genBusinessPostingGroup.findMany({ orderBy: { code: 'asc' } })
        break
      case 'gen-product':
        data = await prisma.genProductPostingGroup.findMany({ orderBy: { code: 'asc' } })
        break
      case 'customer':
        data = await prisma.customerPostingGroup.findMany({ orderBy: { code: 'asc' } })
        break
      case 'vendor':
        data = await prisma.vendorPostingGroup.findMany({ orderBy: { code: 'asc' } })
        break
      case 'inventory':
        data = await prisma.inventoryPostingGroup.findMany({ orderBy: { code: 'asc' } })
        break
      default:
        return NextResponse.json({ error: 'Invalid type. Use: gen-business|gen-product|customer|vendor|inventory' }, { status: 400 })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error('[posting-groups GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') ?? 'gen-business'
  const body = await req.json()

  try {
    let record: unknown
    switch (type) {
      case 'gen-business':
        record = await prisma.genBusinessPostingGroup.create({ data: body })
        break
      case 'gen-product':
        record = await prisma.genProductPostingGroup.create({ data: body })
        break
      case 'customer':
        record = await prisma.customerPostingGroup.create({ data: body })
        break
      case 'vendor':
        record = await prisma.vendorPostingGroup.create({ data: body })
        break
      case 'inventory':
        record = await prisma.inventoryPostingGroup.create({ data: body })
        break
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
    return NextResponse.json(record, { status: 201 })
  } catch (err) {
    console.error('[posting-groups POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
