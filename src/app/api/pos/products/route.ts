import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ─── Mock fallback catalog ─────────────────────────────────────────────────────

const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Artisan Coffee',      sku: 'BEV-001',  price: 5.99,  category: 'Beverages',   image: '' },
  { id: 'p2', name: 'Bluetooth Speaker',   sku: 'ELEC-204', price: 49.99, category: 'Electronics', image: '' },
  { id: 'p3', name: 'Cold Brew',           sku: 'BEV-012',  price: 5.49,  category: 'Beverages',   image: '' },
  { id: 'p4', name: 'Green Tea',           sku: 'BEV-033',  price: 3.49,  category: 'Beverages',   image: '' },
  { id: 'p5', name: 'Water Bottle',        sku: 'ACC-101',  price: 12.99, category: 'Accessories', image: '' },
  { id: 'p6', name: 'Protein Bar',         sku: 'FOOD-044', price: 2.99,  category: 'Food',        image: '' },
  { id: 'p7', name: 'USB-C Cable',         sku: 'ELEC-311', price: 9.99,  category: 'Electronics', image: '' },
  { id: 'p8', name: 'Hand Sanitizer',      sku: 'HYG-007',  price: 4.49,  category: 'Hygiene',     image: '' },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.toLowerCase() ?? ''
  const limit = parseInt(searchParams.get('limit') ?? '50', 10)

  try {
    // ── Attempt DB query ────────────────────────────────────────────────────
    const dbProducts = await (prisma as any).product.findMany({
      where: q
        ? {
            OR: [
              { name:        { contains: q, mode: 'insensitive' } },
              { sku:         { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: {
        id:       true,
        name:     true,
        sku:      true,
        price:    true,
        category: true,
        image:    true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    })

    const products = dbProducts.map((p: any) => ({
      id:       String(p.id),
      name:     p.name,
      sku:      p.sku ?? '',
      price:    Number(p.price ?? 0),
      category: p.category ?? '',
      image:    p.image ?? '',
    }))

    return NextResponse.json({ products, source: 'db' })
  } catch {
    // ── Fallback to mock data when DB is unavailable ────────────────────────
    const filtered = q
      ? MOCK_PRODUCTS.filter(p =>
          p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
        )
      : MOCK_PRODUCTS

    return NextResponse.json({ products: filtered.slice(0, limit), source: 'mock' })
  }
}
