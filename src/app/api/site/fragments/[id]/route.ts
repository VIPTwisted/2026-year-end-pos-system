import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const fragment = await prisma.siteFragment.findUnique({ where: { id } })
    if (!fragment) return NextResponse.json({ error: 'Fragment not found' }, { status: 404 })
    return NextResponse.json(fragment)
  } catch (err) {
    console.error('[site/fragments/[id] GET]', err)
    return NextResponse.json({ error: 'Failed to fetch fragment' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, description, moduleType, config } = body as { name?: string; description?: string; moduleType?: string; config?: string }
    const fragment = await prisma.siteFragment.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(moduleType !== undefined && { moduleType }),
        ...(config !== undefined && { config }),
      },
    })
    return NextResponse.json(fragment)
  } catch (err) {
    console.error('[site/fragments/[id] PATCH]', err)
    return NextResponse.json({ error: 'Failed to update fragment' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.siteFragment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[site/fragments/[id] DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete fragment' }, { status: 500 })
  }
}
