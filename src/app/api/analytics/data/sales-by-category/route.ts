import { NextResponse } from 'next/server'

export async function GET() {
  const raw = [
    { category: 'Footwear', revenue: 284700, units: 2340 },
    { category: 'Apparel', revenue: 196500, units: 4120 },
    { category: 'Electronics', revenue: 412800, units: 890 },
    { category: 'Accessories', revenue: 98200, units: 3780 },
    { category: 'Outerwear', revenue: 158400, units: 1240 },
    { category: 'Sporting Goods', revenue: 87600, units: 1560 },
    { category: 'Home & Living', revenue: 62300, units: 2100 },
    { category: 'Beauty & Personal Care', revenue: 44100, units: 3400 },
  ]
  const total = raw.reduce((s, r) => s + r.revenue, 0)
  return NextResponse.json(raw.map(r => ({ ...r, pct: parseFloat(((r.revenue / total) * 100).toFixed(1)) })))
}
