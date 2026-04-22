import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') ?? '10', 10)
  const products = [
    { productName: 'Nike Air Max 270', unitsSold: 847, revenue: 84953 },
    { productName: 'Levi 501 Original Jeans', unitsSold: 712, revenue: 49484 },
    { productName: 'Apple Watch SE 44mm', unitsSold: 389, revenue: 115311 },
    { productName: 'Hydro Flask 32oz Wide Mouth', unitsSold: 1204, revenue: 42140 },
    { productName: 'Ray-Ban Aviator Classic', unitsSold: 521, revenue: 73461 },
    { productName: 'North Face Thermoball Jacket', unitsSold: 298, revenue: 59302 },
    { productName: 'Adidas Ultraboost 22', unitsSold: 634, revenue: 91576 },
    { productName: 'Patagonia Better Sweater Vest', unitsSold: 445, revenue: 44055 },
    { productName: 'Yeti Rambler 20oz', unitsSold: 987, revenue: 29610 },
    { productName: 'Carhartt WIP Chase Hoodie', unitsSold: 356, revenue: 31284 },
  ].slice(0, limit)
  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0)
  return NextResponse.json(products.map((p, i) => ({ rank: i + 1, ...p, pct: parseFloat(((p.revenue / totalRevenue) * 100).toFixed(1)) })))
}
