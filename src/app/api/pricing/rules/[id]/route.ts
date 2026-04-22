import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rule = await prisma.priceRule.findUnique({ where: { id } })
    if (!rule) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rule)
  } catch (error) {
    console.error('GET /api/pricing/rules/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch rule' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const {
      name, description, ruleType, conditionJson, actionJson,
      customerGroup, priority, stackable, isActive, validFrom, validTo, usageLimit,
    } = body
    const rule = await prisma.priceRule.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(ruleType !== undefined && { ruleType }),
        ...(conditionJson !== undefined && { conditionJson }),
        ...(actionJson !== undefined && { actionJson }),
        ...(customerGroup !== undefined && { customerGroup }),
        ...(priority !== undefined && { priority }),
        ...(stackable !== undefined && { stackable }),
        ...(isActive !== undefined && { isActive }),
        ...(validFrom !== undefined && { validFrom: validFrom ? new Date(validFrom) : null }),
        ...(validTo !== undefined && { validTo: validTo ? new Date(validTo) : null }),
        ...(usageLimit !== undefined && { usageLimit }),
      },
    })
    return NextResponse.json(rule)
  } catch (error) {
    console.error('PATCH /api/pricing/rules/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.priceRule.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/pricing/rules/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 })
  }
}
