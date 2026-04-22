import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    let config = await prisma.posAlertConfig.findFirst({ orderBy: { createdAt: 'asc' } })
    if (!config) {
      config = await prisma.posAlertConfig.create({ data: {} })
    }
    return NextResponse.json({ config })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const existing = await prisma.posAlertConfig.findFirst({ orderBy: { createdAt: 'asc' } })
    let config
    if (existing) {
      config = await prisma.posAlertConfig.update({ where: { id: existing.id }, data: body })
    } else {
      config = await prisma.posAlertConfig.create({ data: body })
    }
    return NextResponse.json({ config })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
