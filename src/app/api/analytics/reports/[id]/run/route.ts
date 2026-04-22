import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function rand(min: number, max: number) { return Math.round(Math.random() * (max - min) + min) }
function randF(min: number, max: number, dec = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(dec)) }

function mockSalesData() {
  const stores = ['Main Street', 'Downtown', 'Westside Mall', 'Airport']
  const products = ['Nike Air Max 270', 'Levi 501 Jeans', 'Apple Watch SE', 'Hydro Flask 32oz', 'Ray-Ban Aviators']
  const categories = ['Footwear', 'Apparel', 'Electronics', 'Accessories', 'Outerwear']
  return Array.from({ length: 50 }, (_, i) => ({
    date: new Date(Date.now() - (49 - i) * 86400000).toISOString().slice(0, 10),
    store: stores[rand(0, stores.length - 1)],
    product: products[rand(0, products.length - 1)],
    category: categories[rand(0, categories.length - 1)],
    qty: rand(1, 20), revenue: randF(20, 800), tax: randF(1, 60), discount: randF(0, 50),
  }))
}
function mockInventoryData() {
  return ['Nike Air Max 270','Levi 501 Jeans','Apple Watch SE','Hydro Flask 32oz','Ray-Ban Aviators','North Face Jacket','Adidas Ultraboost','Patagonia Vest'].map((p, i) => ({
    product: p, sku: `SKU-${1000 + i}`, onHand: rand(0, 150), onOrder: rand(0, 80),
    reorderPoint: rand(10, 30), status: ['In Stock','Low Stock','Out of Stock','Overstock'][rand(0, 3)],
  }))
}
function mockCustomerData() {
  return ['Jane Smith','Bob Johnson','Alice Lee','Tom Brown','Sara Davis','Mike Wilson','Kim Park','Dan Clark'].map(n => ({
    name: n, tier: ['Bronze','Silver','Gold','Platinum'][rand(0, 3)],
    ltv: randF(500, 15000), orders: rand(1, 80),
    lastPurchase: new Date(Date.now() - rand(1, 180) * 86400000).toISOString().slice(0, 10),
    loyaltyPoints: rand(0, 5000),
  }))
}
function mockEmployeeData() {
  return ['Alex Rivera','Jordan Kim','Casey Morgan','Taylor Reyes','Drew Chen','Morgan Lee'].map(e => ({
    name: e, store: ['Main Street','Downtown','Westside Mall'][rand(0, 2)],
    transactions: rand(50, 350), revenue: randF(8000, 85000), avgTicket: randF(45, 220), hours: rand(120, 180),
  }))
}
function mockFinanceData() {
  return ['Jan 2026','Feb 2026','Mar 2026','Apr 2026'].map(p => {
    const revenue = randF(120000, 280000)
    const cogs = revenue * randF(0.45, 0.6)
    const gp = revenue - cogs
    const expenses = randF(20000, 60000)
    return { period: p, revenue, cogs: parseFloat(cogs.toFixed(2)), grossProfit: parseFloat(gp.toFixed(2)), expenses, netIncome: parseFloat((gp - expenses).toFixed(2)) }
  })
}
function mockLoyaltyData() {
  return [
    { program: 'Nova Rewards', cards: 3200, active: 1840, pointsIssued: 485000, pointsRedeemed: 182000, redemptionRate: 37.5 },
    { program: 'VIP Elite', cards: 420, active: 398, pointsIssued: 195000, pointsRedeemed: 97500, redemptionRate: 50.0 },
    { program: 'Student Savings', cards: 780, active: 310, pointsIssued: 62000, pointsRedeemed: 18000, redemptionRate: 29.0 },
  ]
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const report = await prisma.savedReport.findUnique({ where: { id } })
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.savedReport.update({ where: { id }, data: { lastRunAt: new Date() } })
  let data: unknown[] = []
  switch (report.reportType) {
    case 'sales': data = mockSalesData(); break
    case 'inventory': data = mockInventoryData(); break
    case 'customers': data = mockCustomerData(); break
    case 'employees': data = mockEmployeeData(); break
    case 'finance': data = mockFinanceData(); break
    case 'loyalty': data = mockLoyaltyData(); break
    default: data = mockSalesData()
  }
  return NextResponse.json({ reportType: report.reportType, rows: data.length, data, ranAt: new Date().toISOString() })
}
