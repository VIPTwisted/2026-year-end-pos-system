import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const departmentId = searchParams.get('departmentId')
    const status = searchParams.get('status')

    const positions = await prisma.hRPosition.findMany({
      where: {
        ...(departmentId ? { departmentId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { title: 'asc' },
    })
    return NextResponse.json(positions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const position = await prisma.hRPosition.create({ data: body })
    return NextResponse.json(position, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create position' }, { status: 500 })
  }
}
