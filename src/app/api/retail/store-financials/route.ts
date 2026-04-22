import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

const STORES = [
  { id: 'STR001', number: '001', name: 'Chicago Flagship' },
  { id: 'STR002', number: '002', name: 'New York Midtown' },
  { id: 'STR003', number: '003', name: 'Los Angeles West' },
  { id: 'STR004', number: '004', name: 'Dallas Galleria' },
  { id: 'STR005', number: '005', name: 'Miami Brickell' },
  { id: 'STR006', number: '006', name: 'Seattle Downtown' },
]

function generateFinancials(storeId: string) {
  const seeds: Record<string, number> = {
    STR001: 8420, STR002: 12340, STR003: 9870, STR004: 3210, STR005: 7650, STR006: 1399,
  }
  const base = seeds[storeId] ?? 5000

  const hourlyBars = [
    { hour: '8 AM',  sales: Math.round(base * 0.04) },
    { hour: '9 AM',  sales: Math.round(base * 0.06) },
    { hour: '10 AM', sales: Math.round(base * 0.08) },
    { hour: '11 AM', sales: Math.round(base * 0.09) },
    { hour: '12 PM', sales: Math.round(base * 0.12) },
    { hour: '1 PM',  sales: Math.round(base * 0.11) },
    { hour: '2 PM',  sales: Math.round(base * 0.08) },
    { hour: '3 PM',  sales: Math.round(base * 0.07) },
    { hour: '4 PM',  sales: Math.round(base * 0.07) },
    { hour: '5 PM',  sales: Math.round(base * 0.09) },
    { hour: '6 PM',  sales: Math.round(base * 0.10) },
    { hour: '7 PM',  sales: Math.round(base * 0.06) },
    { hour: '8 PM',  sales: Math.round(base * 0.03) },
    { hour: '9 PM',  sales: Math.round(base * 0.01) },
  ]

  const paymentMethods = [
    { method: 'Credit Card', amount: Math.round(base * 0.48), pct: 48 },
    { method: 'Debit Card',  amount: Math.round(base * 0.22), pct: 22 },
    { method: 'Cash',        amount: Math.round(base * 0.18), pct: 18 },
    { method: 'Gift Card',   amount: Math.round(base * 0.07), pct: 7 },
    { method: 'Loyalty',     amount: Math.round(base * 0.05), pct: 5 },
  ]

  const topProducts = [
    { rank: 1,  name: 'Classic Tee - White',  units: 42, revenue: Math.round(base * 0.12), margin: 58 },
    { rank: 2,  name: 'Slim Chino - Navy',    units: 28, revenue: Math.round(base * 0.10), margin: 52 },
    { rank: 3,  name: 'Canvas Sneakers',      units: 19, revenue: Math.round(base * 0.09), margin: 44 },
    { rank: 4,  name: 'Summer Dress - Floral',units: 16, revenue: Math.round(base * 0.08), margin: 62 },
    { rank: 5,  name: 'Hooded Sweatshirt',    units: 14, revenue: Math.round(base * 0.07), margin: 48 },
    { rank: 6,  name: 'Denim Jacket',         units: 11, revenue: Math.round(base * 0.06), margin: 55 },
    { rank: 7,  name: 'Leather Belt',         units: 22, revenue: Math.round(base * 0.05), margin: 70 },
    { rank: 8,  name: 'Wool Scarf',           units: 18, revenue: Math.round(base * 0.04), margin: 66 },
    { rank: 9,  name: 'Running Cap',          units: 31, revenue: Math.round(base * 0.04), margin: 72 },
    { rank: 10, name: 'Sunglasses - Tortoise',units: 9,  revenue: Math.round(base * 0.03), margin: 60 },
  ]

  const openingFloat = 500
  const cashIn = Math.round(base * 0.18)
  const cashOut = 120
  const expectedClose = openingFloat + cashIn - cashOut
  const actualClose = expectedClose - 12
  const variance = actualClose - expectedClose

  return {
    kpis: {
      todaySales: base,
      weekToDate: Math.round(base * 5.8),
      monthToDate: Math.round(base * 22.4),
      vsLastMonthPct: 7.3,
    },
    hourlyBars,
    paymentMethods,
    topProducts,
    cashManagement: {
      openingFloat,
      cashIn,
      cashOut,
      expectedClose,
      actualClose,
      variance,
    },
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storeId = searchParams.get('storeId') ?? 'STR001'

  const store = STORES.find(s => s.id === storeId) ?? STORES[0]
  const financials = generateFinancials(store.id)

  return NextResponse.json({
    stores: STORES,
    selectedStore: store,
    ...financials,
  })
}
