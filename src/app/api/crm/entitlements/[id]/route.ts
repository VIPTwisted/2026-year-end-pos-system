import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const entitlement = await prisma.cRMEntitlement.findUnique({ where: { id } })
    if (!entitlement) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(entitlement)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const entitlement = await prisma.cRMEntitlement.update({ where: { id }, data: body })
    return NextResponse.json(entitlement)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
