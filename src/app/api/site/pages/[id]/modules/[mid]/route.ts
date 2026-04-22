import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; mid: string }> }) {
  try {
    const { mid } = await params
    const body = await req.json()
    const { config, position, hidden, name, moduleType } = body as { config?: string; position?: number; hidden?: boolean; name?: string; moduleType?: string }
    const updated = await prisma.sitePageModule.update({
      where: { id: mid },
      data: {
        ...(config !== undefined && { config }),
        ...(position !== undefined && { position }),
        ...(hidden !== undefined && { hidden }),
        ...(name !== undefined && { name }),
        ...(moduleType !== undefined && { moduleType }),
      },
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[site/pages/[id]/modules/[mid] PATCH]', err)
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; mid: string }> }) {
  try {
    const { mid } = await params
    await prisma.sitePageModule.delete({ where: { id: mid } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[site/pages/[id]/modules/[mid] DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 })
  }
}
