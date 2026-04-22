import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const contract = await prisma.cRMServiceContract.findUnique({ where: { id } })
    if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(contract)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const contract = await prisma.cRMServiceContract.update({ where: { id }, data: body })
    return NextResponse.json(contract)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
