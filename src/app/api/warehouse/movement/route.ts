import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type MovementBody = {
  entryType: string
  locationId: string
  productId: string
  quantity: number
  fromBinCode?: string
  fromZoneCode?: string
  toBinCode?: string
  toZoneCode?: string
  notes?: string
  referenceId?: string
}

export async function POST(req: NextRequest) {
  const body: MovementBody = await req.json()

  const { entryType, locationId, productId, quantity, fromBinCode, fromZoneCode, toBinCode, toZoneCode, notes, referenceId } = body

  if (!entryType) return NextResponse.json({ error: 'entryType is required' }, { status: 400 })
  if (!locationId) return NextResponse.json({ error: 'locationId is required' }, { status: 400 })
  if (!productId) return NextResponse.json({ error: 'productId is required' }, { status: 400 })
  if (typeof quantity !== 'number' || quantity === 0) {
    return NextResponse.json({ error: 'quantity must be a non-zero number' }, { status: 400 })
  }
  // ADJUST allows negative quantities (write-down); all others must be positive
  if (entryType !== 'ADJUST' && quantity < 0) {
    return NextResponse.json({ error: 'quantity must be positive for this entry type' }, { status: 400 })
  }

  const VALID_TYPES = ['RECEIVE', 'PICK', 'PUTAWAY', 'TRANSFER', 'ADJUST', 'WRITE_OFF', 'CROSS_DOCK']
  if (!VALID_TYPES.includes(entryType)) {
    return NextResponse.json({ error: `Invalid entryType. Must be one of: ${VALID_TYPES.join(', ')}` }, { status: 400 })
  }

  // Resolve location
  const location = await prisma.wmsLocation.findUnique({
    where: { id: locationId },
    select: { locationCode: true },
  })
  if (!location) return NextResponse.json({ error: 'Location not found' }, { status: 404 })

  const locationCode = location.locationCode
  const entryNumber = `WME-${Date.now().toString(36).toUpperCase()}`

  // Run in a transaction: create entry + update bin contents
  const entry = await prisma.$transaction(async (tx) => {

    // Create the WmsEntry
    const created = await tx.wmsEntry.create({
      data: {
        entryNumber,
        locationCode,
        productId,
        entryType,
        fromBinCode: fromBinCode ?? null,
        fromZoneCode: fromZoneCode ?? null,
        toBinCode: toBinCode ?? null,
        toZoneCode: toZoneCode ?? null,
        quantity,
        notes: notes ?? null,
        referenceId: referenceId ?? null,
        postedAt: new Date(),
      },
    })

    // --- RECEIVE / PUTAWAY: add qty to toBin ---
    if ((entryType === 'RECEIVE' || entryType === 'PUTAWAY') && toBinCode && toZoneCode) {
      const existing = await tx.wmsBinContent.findFirst({
        where: { locationCode, zoneCode: toZoneCode, binCode: toBinCode, productId, lotNumber: null, serialNumber: null },
      })
      if (existing) {
        await tx.wmsBinContent.update({ where: { id: existing.id }, data: { quantity: { increment: quantity }, state: 'AVAILABLE' } })
      } else {
        await tx.wmsBinContent.create({ data: { locationCode, zoneCode: toZoneCode, binCode: toBinCode, productId, quantity, state: 'AVAILABLE' } })
      }
      await tx.wmsBin.updateMany({ where: { locationCode, zoneCode: toZoneCode, binCode: toBinCode }, data: { isEmpty: false } })
    }

    // --- PICK / SHIP (if PICK type): reduce fromBin qty ---
    if (entryType === 'PICK' && fromBinCode && fromZoneCode) {
      await tx.wmsBinContent.updateMany({
        where: { locationCode, zoneCode: fromZoneCode, binCode: fromBinCode, productId },
        data: { quantity: { decrement: quantity } },
      })
    }

    // --- TRANSFER: reduce fromBin, add toBin ---
    if (entryType === 'TRANSFER' && fromBinCode && fromZoneCode && toBinCode && toZoneCode) {
      await tx.wmsBinContent.updateMany({
        where: { locationCode, zoneCode: fromZoneCode, binCode: fromBinCode, productId },
        data: { quantity: { decrement: quantity } },
      })
      const existingTransfer = await tx.wmsBinContent.findFirst({
        where: { locationCode, zoneCode: toZoneCode, binCode: toBinCode, productId, lotNumber: null, serialNumber: null },
      })
      if (existingTransfer) {
        await tx.wmsBinContent.update({ where: { id: existingTransfer.id }, data: { quantity: { increment: quantity }, state: 'AVAILABLE' } })
      } else {
        await tx.wmsBinContent.create({ data: { locationCode, zoneCode: toZoneCode, binCode: toBinCode, productId, quantity, state: 'AVAILABLE' } })
      }
      await tx.wmsBin.updateMany({ where: { locationCode, zoneCode: toZoneCode, binCode: toBinCode }, data: { isEmpty: false } })
    }

    // --- ADJUST: update qty in specified bin (signed: can be negative for write-down) ---
    if (entryType === 'ADJUST') {
      const binCode = toBinCode ?? fromBinCode
      const zoneCode = toZoneCode ?? fromZoneCode
      if (binCode && zoneCode) {
        await tx.wmsBinContent.updateMany({
          where: { locationCode, zoneCode, binCode, productId },
          data: { quantity: { increment: quantity } },
        })
      }
    }

    // --- WRITE_OFF: state = ADJUSTMENT_QUEUE, qty = 0 in fromBin ---
    if (entryType === 'WRITE_OFF' && fromBinCode && fromZoneCode) {
      await tx.wmsBinContent.updateMany({
        where: { locationCode, zoneCode: fromZoneCode, binCode: fromBinCode, productId },
        data: { quantity: 0, state: 'ADJUSTMENT_QUEUE' },
      })
      await tx.wmsBin.updateMany({
        where: { locationCode, zoneCode: fromZoneCode, binCode: fromBinCode },
        data: { isEmpty: true },
      })
    }

    return created
  })

  return NextResponse.json(entry, { status: 201 })
}
