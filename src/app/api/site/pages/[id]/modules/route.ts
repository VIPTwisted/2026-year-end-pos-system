import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const modules = await prisma.sitePageModule.findMany({ where: { pageId: id }, orderBy: { position: 'asc' } })
    return NextResponse.json(modules)
  } catch (err) {
    console.error('[site/pages/[id]/modules GET]', err)
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { moduleType, name, parentId, config = '{}' } = body as { moduleType: string; name: string; parentId?: string; config?: string }
    if (!moduleType?.trim()) return NextResponse.json({ error: 'moduleType is required' }, { status: 400 })
    if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    const maxPos = await prisma.sitePageModule.aggregate({ where: { pageId: id }, _max: { position: true } })
    const nextPosition = (maxPos._max.position ?? -1) + 1
    const module = await prisma.sitePageModule.create({
      data: { pageId: id, moduleType, name: name.trim(), position: nextPosition, parentId: parentId || null, config, hidden: false },
    })
    return NextResponse.json(module, { status: 201 })
  } catch (err) {
    console.error('[site/pages/[id]/modules POST]', err)
    return NextResponse.json({ error: 'Failed to add module' }, { status: 500 })
  }
}
