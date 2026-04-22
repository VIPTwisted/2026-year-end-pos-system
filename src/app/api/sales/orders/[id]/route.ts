export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const ORDERS: Record<string, object> = {
  'SO-2026-4812': {
    id: 'SO-2026-4812',
    orderNo: 'SO-2026-4812',
    orderDate: '2026-04-15',
    customer: { id: 'C10000', name: 'Fabrikam Inc', contact: 'John Smith', creditStatus: 'OK', balance: 8432.10, creditLimit: 50000.00, creditAvailable: 41567.90 },
    externalDocNo: 'FAB-PO-8821',
    paymentTerms: 'Net 30',
    currency: 'USD',
    salesperson: 'Alice Chen',
    assignedTo: 'Alice Chen',
    status: 'Released',
    shipTo: 'Fabrikam Inc, 192 Industrial Blvd, Detroit MI 48201',
    shipmentMethod: 'UPS Ground',
    shippingAgent: 'UPS',
    trackingNo: '1Z999AA01234567890',
    requestedDeliveryDate: '2026-04-22',
    promisedDelivery: '2026-04-22',
    shippingStatus: 'Shipped',
    lines: [
      { line: 10, item: '1000',    desc: 'Widget Assembly A100',     qtyOrdered: '50',    qtyShipped: '50',    qtyInvoiced: '0', unitPrice: 34.99,   disc: '5%',  lineAmt: 1662.03, status: 'Shipped' },
      { line: 20, item: '1001',    desc: 'Motor Housing B200',       qtyOrdered: '10',    qtyShipped: '10',    qtyInvoiced: '0', unitPrice: 89.00,   disc: '0%',  lineAmt: 890.00,  status: 'Shipped' },
      { line: 30, item: '1006',    desc: 'Coffee Blend Premium',     qtyOrdered: '100',   qtyShipped: '100',   qtyInvoiced: '0', unitPrice: 15.99,   disc: '10%', lineAmt: 1439.10, status: 'Shipped' },
      { line: 40, item: 'SRV-001', desc: 'Installation Service',     qtyOrdered: '8 hrs', qtyShipped: 'N/A',   qtyInvoiced: '0', unitPrice: 125.00,  disc: '0%',  lineAmt: 1000.00, status: 'Open'    },
      { line: 50, item: '1012',    desc: 'Steel Frame Bracket XL',   qtyOrdered: '200',   qtyShipped: '200',   qtyInvoiced: '0', unitPrice: 8.75,    disc: '5%',  lineAmt: 1662.50, status: 'Shipped' },
      { line: 60, item: '1019',    desc: 'Conveyor Belt Segment',    qtyOrdered: '5',     qtyShipped: '5',     qtyInvoiced: '0', unitPrice: 1245.00, disc: '0%',  lineAmt: 6225.00, status: 'Shipped' },
      { line: 70, item: '1024',    desc: 'Control Panel Module',     qtyOrdered: '3',     qtyShipped: '3',     qtyInvoiced: '0', unitPrice: 1420.60, disc: '0%',  lineAmt: 4261.80, status: 'Shipped' },
      { line: 80, item: 'SRV-002', desc: 'Extended Warranty 1-Year', qtyOrdered: '1',     qtyShipped: 'N/A',   qtyInvoiced: '0', unitPrice: 1001.00, disc: '0%',  lineAmt: 1001.00, status: 'Open'    },
    ],
    subtotal: 18241.43,
    discountTotal: 987.51,
    taxRate: 0.0825,
    tax: 1503.91,
    total: 19745.34,
    amountInvoiced: 0,
    amountOutstanding: 19745.34,
    shipments: [
      { shipmentNo: 'Ship-001', shipDate: 'Apr 22, 2026', items: 3, units: 160, carrier: 'UPS', trackingNo: '1Z999AA01234567890', status: 'Delivered' },
    ],
    invoices: [],
  },
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = ORDERS[id] ?? { ...ORDERS['SO-2026-4812'], id, orderNo: id }
  return NextResponse.json({ data: order })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  return NextResponse.json({ data: { id, ...body, updatedAt: new Date().toISOString() } })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return NextResponse.json({ deleted: true, id })
}
