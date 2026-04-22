import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')

    const certs = await prisma.hRCertification.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(certs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch certifications' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const cert = await prisma.hRCertification.create({ data: body })
    return NextResponse.json(cert, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create certification' }, { status: 500 })
  }
}
