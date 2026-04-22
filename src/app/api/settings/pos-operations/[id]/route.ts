import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const operation = await prisma.pOSOperation.findUnique({
      where: { id: params.id },
    })

    if (!operation) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 })
    }

    return NextResponse.json(operation)
  } catch (error) {
    console.error('GET /api/settings/pos-operations/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch POS operation' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Only allow updating these fields — core built-in fields are locked
    const { requiresManager, allowWithoutDrawer, isActive, notes } = body

    const updateData: Record<string, unknown> = {}
    if (requiresManager !== undefined) updateData.requiresManager = requiresManager
    if (allowWithoutDrawer !== undefined) updateData.allowWithoutDrawer = allowWithoutDrawer
    if (isActive !== undefined) updateData.isActive = isActive
    if (notes !== undefined) updateData.notes = notes

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update. Allowed: requiresManager, allowWithoutDrawer, isActive, notes' },
        { status: 400 }
      )
    }

    const operation = await prisma.pOSOperation.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(operation)
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 })
    }
    console.error('PATCH /api/settings/pos-operations/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update POS operation' },
      { status: 500 }
    )
  }
}
