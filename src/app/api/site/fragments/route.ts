import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const fragments = await prisma.siteFragment.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(fragments)
  } catch (err) {
    console.error('[site/fragments GET]', err)
    return NextResponse.json({ error: 'Failed to fetch fragments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, slug, description, moduleType, config = '{}' } = body as { name: string; slug: string; description?: string; moduleType: string; config?: string }
    if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    if (!slug?.trim()) return NextResponse.json({ error: 'slug is required' }, { status: 400 })
    if (!moduleType?.trim()) return NextResponse.json({ error: 'moduleType is required' }, { status: 400 })
    const fragment = await prisma.siteFragment.create({
      data: { name: name.trim(), slug: slug.trim().toLowerCase(), description: description || null, moduleType, config, usageCount: 0 },
    })
    return NextResponse.json(fragment, { status: 201 })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    console.error('[site/fragments POST]', err)
    return NextResponse.json({ error: 'Failed to create fragment' }, { status: 500 })
  }
}
