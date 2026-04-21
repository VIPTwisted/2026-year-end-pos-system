import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const methods = await prisma.shippingMethod.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(methods)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch shipping methods' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, code, carrier, serviceType, baseRate, perLbRate, freeThreshold, estimatedDays } = body

    if (!name || !code) {
      return NextResponse.json({ error: 'name and code are required' }, { status: 400 })
    }

    const existing = await prisma.shippingMethod.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ error: 'Code already exists' }, { status: 409 })
    }

    const method = await prisma.shippingMethod.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        carrier: carrier || undefined,
        serviceType: serviceType || undefined,
        baseRate: parseFloat(baseRate ?? '0'),
        perLbRate: parseFloat(perLbRate ?? '0'),
        freeThreshold: freeThreshold ? parseFloat(freeThreshold) : undefined,
        estimatedDays: estimatedDays ? parseInt(estimatedDays) : undefined,
      },
    })

    return NextResponse.json(method, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create shipping method' }, { status: 500 })
  }
}
