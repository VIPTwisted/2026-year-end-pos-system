import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const centers = await prisma.finCostCenter.findMany({
      orderBy: { code: 'asc' },
    })
    return NextResponse.json(centers)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, name, department, manager, budget } = body as {
      code: string
      name: string
      department?: string
      manager?: string
      budget?: number
    }
    if (!code?.trim() || !name?.trim()) {
      return NextResponse.json({ error: 'code and name are required' }, { status: 400 })
    }
    const center = await prisma.finCostCenter.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        department: department?.trim() ?? null,
        manager: manager?.trim() ?? null,
        budget: budget ?? 0,
      },
    })
    return NextResponse.json(center, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
