import { NextRequest, NextResponse } from 'next/server'

// In-memory store for barcode settings (persists across requests in server process)
// In production this would be backed by a DB settings table or JSON config.

interface UomBarcode {
  id: string
  itemNo: string
  uomCode: string
  barcode: string
  qtyPerUom: string
}

interface BarcodeSettings {
  defaultBarcodeFormat: string
  barcodeSeparator: string
  countryOfOriginCode: string
  autoSearchOnScan: boolean
  openItemCardOnSingleMatch: boolean
  showMultipleResults: boolean
  requireConfirmation: boolean
  labelFormat: string
  printOnReceipt: boolean
  autoPrintOnNewItem: boolean
}

// Module-level cache (survives hot-reloads in dev via singleton pattern)
declare global {
  // eslint-disable-next-line no-var
  var __barcodeSettings: BarcodeSettings | undefined
  // eslint-disable-next-line no-var
  var __uomBarcodes: UomBarcode[] | undefined
}

function getStore() {
  if (!global.__barcodeSettings) {
    global.__barcodeSettings = {
      defaultBarcodeFormat: 'EAN-13',
      barcodeSeparator: '',
      countryOfOriginCode: 'US',
      autoSearchOnScan: true,
      openItemCardOnSingleMatch: true,
      showMultipleResults: true,
      requireConfirmation: false,
      labelFormat: '4x6',
      printOnReceipt: false,
      autoPrintOnNewItem: false,
    }
  }
  if (!global.__uomBarcodes) {
    global.__uomBarcodes = []
  }
  return { settings: global.__barcodeSettings, uomBarcodes: global.__uomBarcodes }
}

export async function GET() {
  const store = getStore()
  return NextResponse.json({ settings: store.settings, uomBarcodes: store.uomBarcodes })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      settings?: Partial<BarcodeSettings>
      uomBarcodes?: UomBarcode[]
    }

    const store = getStore()

    if (body.settings) {
      global.__barcodeSettings = { ...store.settings, ...body.settings }
    }
    if (body.uomBarcodes !== undefined) {
      global.__uomBarcodes = body.uomBarcodes.map((row, i) => ({
        ...row,
        id: row.id?.startsWith('new-') ? `uom-${Date.now()}-${i}` : row.id,
      }))
    }

    return NextResponse.json({ settings: global.__barcodeSettings, uomBarcodes: global.__uomBarcodes })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  return POST(req)
}
