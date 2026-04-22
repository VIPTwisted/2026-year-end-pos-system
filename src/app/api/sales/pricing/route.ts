'use server'
import { NextResponse } from 'next/server'

type PriceListType = 'Base price' | 'Customer price' | 'Promotional' | 'Clearance'
type PriceListStatus = 'Active' | 'Inactive' | 'Scheduled'
type DiscountType = 'Line discount' | 'Multi-line' | 'Payment' | 'Cash discount'

interface PriceList {
  id: string
  name: string
  currency: string
  type: PriceListType
  startDate: string
  endDate: string
  status: PriceListStatus
  itemsCount: number
}

interface DiscountRule {
  id: string
  name: string
  type: DiscountType
  minQty: number
  discountPct: number
  start: string
  end: string
  priority: number
  appliesTo: string
}

interface SimItem {
  id: string
  sku: string
  name: string
  basePrice: number
}

const priceLists: PriceList[] = [
  { id: 'PL001', name: 'Base Price List 2026',      currency: 'USD', type: 'Base price',     startDate: '2026-01-01', endDate: '2026-12-31', status: 'Active',    itemsCount: 1842 },
  { id: 'PL002', name: 'VIP Customer Pricing',      currency: 'USD', type: 'Customer price', startDate: '2026-01-01', endDate: '2026-12-31', status: 'Active',    itemsCount: 987 },
  { id: 'PL003', name: 'Q1 2026 Promotions',        currency: 'USD', type: 'Promotional',    startDate: '2026-01-01', endDate: '2026-03-31', status: 'Active',    itemsCount: 234 },
  { id: 'PL004', name: 'End-of-Season Clearance',   currency: 'USD', type: 'Clearance',      startDate: '2026-02-01', endDate: '2026-02-28', status: 'Scheduled', itemsCount: 118 },
  { id: 'PL005', name: 'Canada Distributor Prices', currency: 'CAD', type: 'Customer price', startDate: '2025-07-01', endDate: '2025-12-31', status: 'Inactive',  itemsCount: 560 },
]

const discountRules: DiscountRule[] = [
  { id: 'DR001', name: 'Bulk Order — 10+ units',    type: 'Line discount',  minQty: 10,  discountPct: 5,   start: '2026-01-01', end: '2026-12-31', priority: 1, appliesTo: 'All items' },
  { id: 'DR002', name: 'Bulk Order — 50+ units',    type: 'Line discount',  minQty: 50,  discountPct: 10,  start: '2026-01-01', end: '2026-12-31', priority: 2, appliesTo: 'All items' },
  { id: 'DR003', name: 'Multi-line Basket Discount', type: 'Multi-line',     minQty: 1,   discountPct: 3,   start: '2026-01-01', end: '2026-06-30', priority: 3, appliesTo: '3+ line items' },
  { id: 'DR004', name: 'Early Payment — Net 10',    type: 'Payment',        minQty: 1,   discountPct: 2,   start: '2026-01-01', end: '2026-12-31', priority: 4, appliesTo: 'Net 10 payment' },
  { id: 'DR005', name: 'Cash Discount 1%/10',       type: 'Cash discount',  minQty: 1,   discountPct: 1,   start: '2026-01-01', end: '2026-12-31', priority: 5, appliesTo: 'Cash/ACH' },
  { id: 'DR006', name: 'VIP Customer Extra',        type: 'Line discount',  minQty: 1,   discountPct: 7.5, start: '2026-01-01', end: '2026-12-31', priority: 1, appliesTo: 'VIP Customer tier' },
  { id: 'DR007', name: 'Q1 Promo Stacking',         type: 'Multi-line',     minQty: 5,   discountPct: 4,   start: '2026-01-01', end: '2026-03-31', priority: 2, appliesTo: 'Promo SKUs only' },
  { id: 'DR008', name: 'Clearance Flat 20%',        type: 'Line discount',  minQty: 1,   discountPct: 20,  start: '2026-02-01', end: '2026-02-28', priority: 1, appliesTo: 'Clearance category' },
]

const simItems: SimItem[] = [
  { id: 'SKU001', sku: 'PROD-A100', name: 'Industrial Pump Unit',      basePrice: 1249.99 },
  { id: 'SKU002', sku: 'PROD-B200', name: 'Control Panel Module',      basePrice: 449.00 },
  { id: 'SKU003', sku: 'PROD-C300', name: 'Hydraulic Cylinder 80mm',   basePrice: 289.50 },
  { id: 'SKU004', sku: 'PROD-D400', name: 'Sensor Array Kit',          basePrice: 179.00 },
  { id: 'SKU005', sku: 'PROD-E500', name: 'Cable Management System',   basePrice: 89.99 },
]

const simCustomers = [
  { id: 'CUST-STD', name: 'Standard Customer',    tier: 'standard' },
  { id: 'CUST-VIP', name: 'VIP Customer (Tier 1)', tier: 'vip' },
  { id: 'CUST-DIST', name: 'Distributor Partner',  tier: 'distributor' },
]

export async function GET() {
  return NextResponse.json({ priceLists, discountRules, simItems, simCustomers })
}

export async function POST(req: Request) {
  const { itemId, customerId, qty } = await req.json()
  const item = simItems.find((i) => i.id === itemId)
  const customer = simCustomers.find((c) => c.id === customerId)
  if (!item || !customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const quantity = Number(qty) || 1
  const base = item.basePrice

  const waterfall: { rule: string; pct: number; saving: number }[] = []
  let price = base

  // VIP discount
  if (customer.tier === 'vip') {
    const rule = discountRules.find((d) => d.id === 'DR006')!
    const saving = price * (rule.discountPct / 100)
    waterfall.push({ rule: rule.name, pct: rule.discountPct, saving })
    price -= saving
  }

  // Bulk discount
  if (quantity >= 50) {
    const rule = discountRules.find((d) => d.id === 'DR002')!
    const saving = price * (rule.discountPct / 100)
    waterfall.push({ rule: rule.name, pct: rule.discountPct, saving })
    price -= saving
  } else if (quantity >= 10) {
    const rule = discountRules.find((d) => d.id === 'DR001')!
    const saving = price * (rule.discountPct / 100)
    waterfall.push({ rule: rule.name, pct: rule.discountPct, saving })
    price -= saving
  }

  const totalDiscount = base - price
  const totalDiscountPct = ((totalDiscount / base) * 100)

  return NextResponse.json({
    item: { sku: item.sku, name: item.name, basePrice: base },
    customer: { name: customer.name, tier: customer.tier },
    qty: quantity,
    finalPrice: Math.round(price * 100) / 100,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    totalDiscountPct: Math.round(totalDiscountPct * 10) / 10,
    lineTotal: Math.round(price * quantity * 100) / 100,
    waterfall,
  })
}
