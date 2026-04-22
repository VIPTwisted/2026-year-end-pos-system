import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const bindings = await prisma.siteBinding.findMany({
      where: { siteId: id },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(bindings)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bindings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { channelId, channelName, domainName, locale, isPrimary } = body

    if (isPrimary) {
      await prisma.siteBinding.updateMany({
        where: { siteId: id, isPrimary: true },
        data: { isPrimary: false },
      })
    }

    const binding = await prisma.siteBinding.create({
      data: {
        siteId: id,
        channelId,
        channelName,
        domainName,
        locale: locale ?? 'en-us',
        isPrimary: isPrimary ?? false,
      },
    })
    return NextResponse.json(binding, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create binding' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const bindingId = searchParams.get('bindingId')
    if (!bindingId) return NextResponse.json({ error: 'bindingId required' }, { status: 400 })

    await prisma.siteBinding.deleteMany({ where: { id: bindingId, siteId: id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete binding' }, { status: 500 })
  }
}
