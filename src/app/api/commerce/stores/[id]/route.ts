import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT * FROM "CommerceStore" WHERE id = ${id}
    `
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const terminals = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT * FROM "PosTerminal" WHERE storeId = ${id} ORDER BY terminalId ASC
    `.catch(() => [])
    return NextResponse.json({ ...rows[0], terminals })
  } catch (err) {
    console.error('[commerce/stores/:id GET]', err)
    return NextResponse.json({ error: 'Failed to fetch store' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const {
      name, channelId, channelType, currency, taxGroup, taxRate, timeZone,
      address, city, state, zip, phone, email,
      statementMethod, emailReceipt, bgOperationsEnabled, status,
    } = body as Record<string, unknown>

    await prisma.$executeRaw`
      UPDATE "CommerceStore" SET
        name = COALESCE(${name ?? null}, name),
        channelId = COALESCE(${channelId ?? null}, channelId),
        channelType = COALESCE(${channelType ?? null}, channelType),
        currency = COALESCE(${currency ?? null}, currency),
        taxGroup = COALESCE(${taxGroup ?? null}, taxGroup),
        taxRate = COALESCE(${taxRate ?? null}, taxRate),
        timeZone = COALESCE(${timeZone ?? null}, timeZone),
        address = COALESCE(${address ?? null}, address),
        city = COALESCE(${city ?? null}, city),
        state = COALESCE(${state ?? null}, state),
        zip = COALESCE(${zip ?? null}, zip),
        phone = COALESCE(${phone ?? null}, phone),
        email = COALESCE(${email ?? null}, email),
        statementMethod = COALESCE(${statementMethod ?? null}, statementMethod),
        emailReceipt = COALESCE(${emailReceipt !== undefined ? (emailReceipt ? 1 : 0) : null}, emailReceipt),
        bgOperationsEnabled = COALESCE(${bgOperationsEnabled !== undefined ? (bgOperationsEnabled ? 1 : 0) : null}, bgOperationsEnabled),
        status = COALESCE(${status ?? null}, status),
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `
    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT * FROM "CommerceStore" WHERE id = ${id}
    `
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error('[commerce/stores/:id PATCH]', err)
    return NextResponse.json({ error: 'Failed to update store' }, { status: 500 })
  }
}
