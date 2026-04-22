import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateDocNumber(): string {
  const num = Math.floor(Math.random() * 900000) + 100000
  return `FD-${num}`
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const deviceId = searchParams.get('deviceId')
    const documentType = searchParams.get('documentType')

    const docs = await prisma.fiscalDocument.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(deviceId ? { deviceId } : {}),
        ...(documentType ? { documentType } : {}),
      },
      include: {
        device: { select: { name: true, deviceType: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(docs)
  } catch (error) {
    console.error('[GET /api/fiscal/documents]', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { deviceId, documentType, referenceId, amount, tax, payload } = body

    let documentNumber = generateDocNumber()
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.fiscalDocument.findUnique({ where: { documentNumber } })
      if (!existing) break
      documentNumber = generateDocNumber()
      attempts++
    }

    const doc = await prisma.fiscalDocument.create({
      data: {
        deviceId: deviceId ?? null,
        documentType: documentType ?? 'receipt',
        documentNumber,
        referenceId: referenceId ?? null,
        amount: amount ? Number(amount) : 0,
        tax: tax ? Number(tax) : 0,
        payload: payload ? (typeof payload === 'string' ? payload : JSON.stringify(payload)) : null,
        status: 'pending',
      },
      include: {
        device: { select: { name: true, deviceType: true } },
      },
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    console.error('[POST /api/fiscal/documents]', error)
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
}
