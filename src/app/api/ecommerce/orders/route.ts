export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    kpis: {
      onlineOrdersToday: 47,
      pendingFulfillment: 23,
      shippedToday: 18,
      revenueToday: 4821,
      avgOrderValue: 102.57,
    },
    orders: [
      { id: 'o1', orderNum: 'ONL-2026-8421', source: 'Website', customer: 'Sarah Martinez', itemCount: 2, total: 124.48, payment: 'Visa ****4821', shipMethod: 'UPS Ground', status: 'Processing', placedAt: 'Apr 22 10:42 AM' },
      { id: 'o2', orderNum: 'ONL-2026-8420', source: 'Mobile App', customer: 'James Chen', itemCount: 1, total: 34.99, payment: 'Apple Pay', shipMethod: 'USPS', status: 'Shipped', placedAt: 'Apr 22 9:15 AM' },
      { id: 'o3', orderNum: 'ONL-2026-8419', source: 'Website', customer: 'Lisa Park', itemCount: 3, total: 287.50, payment: 'Mastercard ****2341', shipMethod: 'FedEx', status: 'New', placedAt: 'Apr 22 8:30 AM' },
      { id: 'o4', orderNum: 'B2B-2026-0891', source: 'B2B Portal', customer: 'Michael Torres', company: 'Fabrikam Inc', itemCount: 50, total: 1749.50, payment: 'Net 30', shipMethod: 'LTL Freight', status: 'Processing', placedAt: 'Apr 21 3:00 PM' },
      { id: 'o5', orderNum: 'MKT-2026-1241', source: 'Marketplace', customer: 'Robert Johnson', itemCount: 1, total: 49.99, payment: 'Marketplace Pay', shipMethod: 'Standard', status: 'Shipped', placedAt: 'Apr 21 11:20 AM' },
    ],
    syncStatus: {
      lastSync: '14 minutes ago',
      errors: 0,
      channel: 'Online Store',
    },
  })
}
