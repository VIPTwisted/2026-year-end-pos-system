import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const menu = await prisma.siteNavMenu.findUnique({ where: { id }, include: { items: { orderBy: { position: 'asc' } } } })
    if (!menu) return NextResponse.json({ error: 'Menu not found' }, { status: 404 })
    return NextResponse.json(menu)
  } catch (err) {
    console.error('[site/menus/[id] GET]', err)
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, location, isActive, items } = body as { name?: string; location?: string; isActive?: boolean; items?: Array<{ label: string; url: string; position: number; parentId?: string; openNew?: boolean }> }
    await prisma.siteNavMenu.update({ where: { id }, data: { ...(name !== undefined && { name }), ...(location !== undefined && { location }), ...(isActive !== undefined && { isActive }) } })
    if (items !== undefined) {
      await prisma.siteNavItem.deleteMany({ where: { menuId: id } })
      if (items.length > 0) {
        await prisma.siteNavItem.createMany({ data: items.map(item => ({ menuId: id, label: item.label, url: item.url, position: item.position, parentId: item.parentId || null, openNew: item.openNew ?? false })) })
      }
    }
    const updated = await prisma.siteNavMenu.findUnique({ where: { id }, include: { items: { orderBy: { position: 'asc' } } } })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[site/menus/[id] PATCH]', err)
    return NextResponse.json({ error: 'Failed to update menu' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.siteNavMenu.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[site/menus/[id] DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete menu' }, { status: 500 })
  }
}
