import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, FileText, Palette, Navigation, Search, Plus } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'secondary' | 'destructive' | 'outline'> = {
  published: 'success',
  draft: 'secondary',
  archived: 'outline',
}

export default async function SiteBuilderPage() {
  const [pages, themes] = await Promise.all([
    prisma.sitePage.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
    prisma.siteTheme.findMany({ orderBy: { createdAt: 'desc' } }),
  ])

  const published = pages.filter(p => p.status === 'published').length
  const drafts = pages.filter(p => p.status === 'draft').length
  const activeTheme = themes.find(t => t.isActive)

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TopBar title="Site Builder" />
      <div className="flex-1 overflow-auto p-6 space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-zinc-100">{pages.length}</div>
                  <div className="text-xs text-zinc-500 mt-1">Total Pages</div>
                </div>
                <FileText className="w-8 h-8 text-blue-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-emerald-400">{published}</div>
                  <div className="text-xs text-zinc-500 mt-1">Published</div>
                </div>
                <Globe className="w-8 h-8 text-emerald-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-amber-400">{drafts}</div>
                  <div className="text-xs text-zinc-500 mt-1">Drafts</div>
                </div>
                <FileText className="w-8 h-8 text-amber-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-zinc-100 truncate max-w-[120px]">
                    {activeTheme?.name ?? 'None'}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Active Theme</div>
                </div>
                <Palette className="w-8 h-8 text-violet-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Pages', href: '/site-builder/pages', icon: FileText, desc: 'Manage all pages' },
            { label: 'Themes', href: '/site-builder/themes', icon: Palette, desc: 'Customize design' },
            { label: 'Navigation', href: '/site-builder/navigation', icon: Navigation, desc: 'Menu structure' },
            { label: 'SEO', href: '/site-builder/seo', icon: Search, desc: 'Meta & sitemaps' },
          ].map(({ label, href, icon: Icon, desc }) => (
            <Link key={href} href={href}>
              <Card className="bg-zinc-900 border-zinc-800 hover:border-blue-600 transition-colors cursor-pointer h-full">
                <CardContent className="pt-5 flex flex-col gap-2">
                  <Icon className="w-6 h-6 text-blue-400" />
                  <div className="text-sm font-semibold text-zinc-100">{label}</div>
                  <div className="text-xs text-zinc-500">{desc}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Pages */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-100">Recent Pages</CardTitle>
            <Link href="/site-builder/pages">
              <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-1">
                <Plus className="w-3 h-3" /> New Page
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pages.length === 0 ? (
              <div className="text-sm text-zinc-500 py-4 text-center">No pages yet. Create your first page.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                      <th className="text-left py-2 font-medium">Title</th>
                      <th className="text-left py-2 font-medium">Slug</th>
                      <th className="text-left py-2 font-medium">Template</th>
                      <th className="text-left py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.slice(0, 8).map(p => (
                      <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                        <td className="py-2 text-zinc-200 font-medium">{p.title}</td>
                        <td className="py-2 text-zinc-400 font-mono text-xs">/{p.slug}</td>
                        <td className="py-2 text-zinc-400 capitalize">{p.template}</td>
                        <td className="py-2">
                          <Badge variant={STATUS_VARIANT[p.status] ?? 'secondary'} className="capitalize text-xs">
                            {p.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
