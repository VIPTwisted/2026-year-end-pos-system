import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sitemap = await prisma.siteMap.findUnique({ where: { id } })
  if (!sitemap) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'
  const urls: string[] = []

  // Pages
  if (sitemap.includePages) {
    const pages = await prisma.sitePage.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    })
    for (const p of pages) {
      urls.push(
        `  <url>\n    <loc>${baseUrl}/${p.slug}</loc>\n    <lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
      )
    }
  }

  // Products
  if (sitemap.includeProducts) {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true },
    })
    for (const p of products) {
      urls.push(
        `  <url>\n    <loc>${baseUrl}/products/${p.id}</loc>\n    <lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
      )
    }
  }

  // Categories
  if (sitemap.includeCategories) {
    const cats = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true },
    })
    for (const c of cats) {
      urls.push(
        `  <url>\n    <loc>${baseUrl}/categories/${c.id}</loc>\n    <lastmod>${c.updatedAt.toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`
      )
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  const updated = await prisma.siteMap.update({
    where: { id },
    data: { generatedXml: xml, lastGenerated: new Date() },
  })

  return NextResponse.json({ ok: true, lastGenerated: updated.lastGenerated, urlCount: urls.length })
}
