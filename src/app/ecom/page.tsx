'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Globe, BookOpen, Package, Star, Search, Image, ArrowRight, TrendingUp } from 'lucide-react'

interface EcomStats {
  publishedCatalogs: number
  activeProducts: number
  pendingReviews: number
  activeBanners: number
  featuredProducts: number
}

export default function EcomHubPage() {
  const [stats, setStats] = useState<EcomStats>({
    publishedCatalogs: 0,
    activeProducts: 0,
    pendingReviews: 0,
    activeBanners: 0,
    featuredProducts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [catalogs, products, ratings, banners, featured] = await Promise.all([
          fetch('/api/ecom/catalogs?status=published').then(r => r.json()),
          fetch('/api/ecom/products?status=active').then(r => r.json()),
          fetch('/api/ecom/ratings?status=pending').then(r => r.json()),
          fetch('/api/ecom/banners').then(r => r.json()),
          fetch('/api/ecom/products?isFeatured=true').then(r => r.json()),
        ])
        setStats({
          publishedCatalogs: Array.isArray(catalogs) ? catalogs.length : 0,
          activeProducts: Array.isArray(products) ? products.length : 0,
          pendingReviews: Array.isArray(ratings) ? ratings.length : 0,
          activeBanners: Array.isArray(banners) ? banners.filter((b: { isActive: boolean }) => b.isActive).length : 0,
          featuredProducts: Array.isArray(featured) ? featured.length : 0,
        })
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const kpis = [
    { label: 'Published Catalogs', value: stats.publishedCatalogs, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Active Products', value: stats.activeProducts, icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Pending Reviews', value: stats.pendingReviews, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Active Banners', value: stats.activeBanners, icon: Image, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    { label: 'Featured Products', value: stats.featuredProducts, icon: TrendingUp, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  ]

  const quickLinks = [
    { label: 'Catalog Management', href: '/ecom/catalogs', icon: BookOpen, desc: 'Manage product catalogs and channels' },
    { label: 'Product Enrichment', href: '/ecom/products', icon: Package, desc: 'Enrich products with content, media, SEO' },
    { label: 'Ratings & Reviews', href: '/ecom/ratings', icon: Star, desc: 'Moderate customer reviews' },
    { label: 'Search Configuration', href: '/ecom/search-config', icon: Search, desc: 'Boost fields, facets, synonyms' },
    { label: 'Banners & Promotions', href: '/ecom/banners', icon: Image, desc: 'Manage storefront banners by placement' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Globe className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-zinc-100">E-Commerce Hub</h1>
        </div>
        <p className="text-zinc-400 text-sm">Dynamics 365 Commerce — storefront management</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={`rounded-xl border p-4 ${k.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <k.icon className={`w-5 h-5 ${k.color}`} />
            </div>
            <div className={`text-3xl font-bold ${k.color} mb-1`}>
              {loading ? '—' : k.value}
            </div>
            <div className="text-xs text-zinc-400">{k.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Quick Access</h2>
        <div className="grid grid-cols-3 gap-4">
          {quickLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-600 hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <l.icon className="w-5 h-5 text-blue-400" />
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </div>
              <div className="text-sm font-semibold text-zinc-100 mb-1">{l.label}</div>
              <div className="text-xs text-zinc-500">{l.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
