import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const menus = await prisma.siteNavMenu.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { items: true } } } })
    return NextResponse.json(menus)
  } catch (err) {
    console.error('[site/menus GET]', err)
    return NextResponse.json({ error: 'Failed to fetch menus' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, location } = body as { name: string; location: string }
    if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    if (!location?.trim()) return NextResponse.json({ error: 'location is required' }, { status: 400 })
    const menu = await prisma.siteNavMenu.create({ data: { name: name.trim(), location, isActive: true } })
    return NextResponse.json(menu, { status: 201 })
  } catch (err) {
    console.error('[site/menus POST]', err)
    return NextResponse.json({ error: 'Failed to create menu' }, { status: 500 })
  }
}
