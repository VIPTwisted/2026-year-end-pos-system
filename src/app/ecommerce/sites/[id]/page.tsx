'use client'

import { useEffect, useState, use } from 'react'
import { cn } from '@/lib/utils'
import {
  Globe,
  Layers,
  Lock,
  Server,
  FileText,
  Plus,
  Trash2,
  Star,
  CheckCircle2,
  AlertCircle,
  WifiOff,
  Loader2,
  RefreshCw,
  AlertTriangle,
  X,
} from 'lucide-react'

const LOCALES = ['en-us', 'fr', 'de', 'es', 'zh', 'ja']
const PAGE_TYPES = ['home', 'pdp', 'plp', 'cart', 'checkout', 'account', 'custom']

interface SiteBinding { id: string; channelId: string | null; channelName: string | null; domainName: string | null; locale: string; isPrimary: boolean; isActive: boolean }
interface SitePage { id: string; pageId: string; pageName: string; pageType: string; urlPath: string; status: string; publishedAt: string | null }
interface SiteDeployment { id: string; version: string | null; deployedBy: string | null; deployedAt: string; status: string; notes: string | null }
interface SiteAuthProvider { id: string; providerName: string; providerType: string; clientId: string | null; tenantId: string | null; isActive: boolean }
interface EcommerceSite {
  id: string; siteId: string; siteName: string; description: string | null; status: string
  theme: string | null; defaultLocale: string; robotsTxt: string | null; faviconUrl: string | null; cdnUrl: string | null
  bindings: SiteBinding[]; pages: SitePage[]; deployments: SiteDeployment[]; authProviders: SiteAuthProvider[]
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    provisioning: { label: 'Provisioning', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    live: { label: 'Live', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
    offline: { label: 'Offline', cls: 'bg-zinc-700/40 text-zinc-400 border-zinc-700', icon: <WifiOff className="w-3 h-3" /> },
    failed: { label: 'Failed', cls: 'bg-red-500/10 text-red-400 border-red-500/20', icon: <AlertCircle className="w-3 h-3" /> },
    deploying: { label: 'Deploying', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    rolled_back: { label: 'Rolled Back', cls: 'bg-zinc-700/40 text-zinc-400 border-zinc-700', icon: <RefreshCw className="w-3 h-3" /> },
    draft: { label: 'Draft', cls: 'bg-zinc-700/40 text-zinc-400 border-zinc-700', icon: <FileText className="w-3 h-3" /> },
    published: { label: 'Published', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
    scheduled: { label: 'Scheduled', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <RefreshCw className="w-3 h-3" /> },
  }
  const s = map[status] ?? map.offline
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border', s.cls)}>
      {s.icon}{s.label}
    </span>
  )
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-zinc-100">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function SiteDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [site, setSite] = useState<EcommerceSite | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  // Config edits
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  // Modals
  const [bindingModal, setBindingModal] = useState(false)
  const [pageModal, setPageModal] = useState(false)
  const [authModal, setAuthModal] = useState(false)

  // Binding form
  const [bindingForm, setBindingForm] = useState({ channelId: '', channelName: '', domainName: '', locale: 'en-us', isPrimary: false })
  // Page form
  const [pageForm, setPageForm] = useState({ pageId: '', pageName: '', pageType: 'home', urlPath: '' })
  // Auth form
  const [authForm, setAuthForm] = useState({ providerName: 'Azure AD B2C', providerType: 'oidc', clientId: '', tenantId: '' })
  // Page filter
  const [pageStatusFilter, setPageStatusFilter] = useState('all')
  const [pageTypeFilter, setPageTypeFilter] = useState('all')

  const fetchSite = () => {
    setLoading(true)
    fetch(`/api/ecommerce/sites/${id}`)
      .then((r) => r.json())
      .then((d) => { setSite(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchSite() }, [id])

  const handleSaveConfig = async (patch: Partial<EcommerceSite>) => {
    if (!site) return
    setSaving(true)
    const res = await fetch(`/api/ecommerce/sites/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (res.ok) { const d = await res.json(); setSite({ ...site, ...d }) }
    setSaving(false)
  }

  const handlePublish = async () => {
    if (!site) return
    setPublishing(true)
    const version = `v${Date.now().toString(36).toUpperCase()}`
    await fetch(`/api/ecommerce/sites/${id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version, deployedBy: 'Admin' }),
    })
    setSite({ ...site, status: 'provisioning' })
    setPublishing(false)
    setTimeout(fetchSite, 1500)
  }

  const handleAddBinding = async () => {
    await fetch(`/api/ecommerce/sites/${id}/bindings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bindingForm),
    })
    setBindingModal(false)
    setBindingForm({ channelId: '', channelName: '', domainName: '', locale: 'en-us', isPrimary: false })
    fetchSite()
  }

  const handleDeleteBinding = async (bindingId: string) => {
    await fetch(`/api/ecommerce/sites/${id}/bindings?bindingId=${bindingId}`, { method: 'DELETE' })
    fetchSite()
  }

  const handleAddPage = async () => {
    await fetch(`/api/ecommerce/sites/${id}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pageForm),
    })
    setPageModal(false)
    setPageForm({ pageId: '', pageName: '', pageType: 'home', urlPath: '' })
    fetchSite()
  }

  const handlePublishPage = async (pageId: string) => {
    await fetch(`/api/ecommerce/sites/${id}/pages/${pageId}/publish`, { method: 'POST' })
    fetchSite()
  }

  const handleUnpublishPage = async (pageId: string) => {
    await fetch(`/api/ecommerce/sites/${id}/pages/${pageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'draft' }),
    })
    fetchSite()
  }

  const handleDeletePage = async (pageId: string) => {
    await fetch(`/api/ecommerce/sites/${id}/pages/${pageId}`, { method: 'DELETE' })
    fetchSite()
  }

  const handleAddAuth = async () => {
    await fetch(`/api/ecommerce/sites/${id}/auth-providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authForm),
    })
    setAuthModal(false)
    setAuthForm({ providerName: 'Azure AD B2C', providerType: 'oidc', clientId: '', tenantId: '' })
    fetchSite()
  }

  const handleDeleteAuth = async (providerId: string) => {
    await fetch(`/api/ecommerce/sites/${id}/auth-providers?providerId=${providerId}`, { method: 'DELETE' })
    fetchSite()
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Server },
    { key: 'bindings', label: 'Channel Bindings', icon: Globe },
    { key: 'pages', label: 'Pages', icon: FileText },
    { key: 'auth', label: 'Authentication', icon: Lock },
    { key: 'deployments', label: 'Deployments', icon: RefreshCw },
  ]

  const filteredPages = (site?.pages ?? []).filter((p) => {
    if (pageStatusFilter !== 'all' && p.status !== pageStatusFilter) return false
    if (pageTypeFilter !== 'all' && p.pageType !== pageTypeFilter) return false
    return true
  })

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  if (!site) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center text-zinc-400">
        Site not found.
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">{site.siteName}</h1>
              <StatusBadge status={site.status} />
            </div>
            <code className="text-xs text-zinc-500 font-mono">{site.siteId}</code>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-zinc-800 mb-6">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB: Overview ── */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status panel */}
            <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
              <h3 className="text-sm font-semibold text-zinc-200">Deployment status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Current status</span>
                  <StatusBadge status={site.status} />
                </div>
                {site.deployments[0] && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400">Last deployment</span>
                      <span className="text-xs text-zinc-300">{new Date(site.deployments[0].deployedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400">Version</span>
                      <code className="text-xs text-zinc-300 font-mono">{site.deployments[0].version ?? '—'}</code>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-md text-sm font-medium transition-colors"
              >
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {publishing ? 'Publishing...' : 'Publish Site'}
              </button>
            </div>

            {/* Config grid */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-zinc-200 mb-4">Site configuration</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Site ID</label>
                    <code className="block w-full bg-zinc-800/50 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-400 font-mono">{site.siteId}</code>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Site name</label>
                    <input
                      defaultValue={site.siteName}
                      onBlur={(e) => handleSaveConfig({ siteName: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Default locale</label>
                    <select
                      defaultValue={site.defaultLocale}
                      onChange={(e) => handleSaveConfig({ defaultLocale: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    >
                      {LOCALES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Theme</label>
                    <input
                      defaultValue={site.theme ?? ''}
                      onBlur={(e) => handleSaveConfig({ theme: e.target.value })}
                      placeholder="e.g. Fabrikam"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">CDN URL</label>
                  <input
                    defaultValue={site.cdnUrl ?? ''}
                    onBlur={(e) => handleSaveConfig({ cdnUrl: e.target.value })}
                    placeholder="https://cdn.example.com"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Favicon URL</label>
                  <input
                    defaultValue={site.faviconUrl ?? ''}
                    onBlur={(e) => handleSaveConfig({ faviconUrl: e.target.value })}
                    placeholder="https://example.com/favicon.ico"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Robots.txt</label>
                  <textarea
                    defaultValue={site.robotsTxt ?? ''}
                    onBlur={(e) => handleSaveConfig({ robotsTxt: e.target.value })}
                    rows={3}
                    placeholder="User-agent: *&#10;Disallow: /checkout"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Channel Bindings ── */}
        {tab === 'bindings' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-zinc-400">Each binding maps your site to a retail channel for a specific locale.</p>
              <button
                onClick={() => setBindingModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add binding
              </button>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Channel name', 'Domain', 'Locale', 'Primary', 'Active', ''].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-zinc-400 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {site.bindings.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-zinc-500 text-sm">No bindings configured.</td></tr>
                  ) : site.bindings.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 text-zinc-200">{b.channelName ?? <span className="text-zinc-500">—</span>}</td>
                      <td className="px-4 py-3 font-mono text-zinc-300 text-xs">{b.domainName ?? '—'}</td>
                      <td className="px-4 py-3 text-zinc-400">{b.locale}</td>
                      <td className="px-4 py-3">
                        {b.isPrimary && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('w-2 h-2 rounded-full inline-block', b.isActive ? 'bg-emerald-400' : 'bg-zinc-600')} />
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDeleteBinding(b.id)} className="text-zinc-500 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Modal open={bindingModal} onClose={() => setBindingModal(false)} title="Add channel binding">
              <div className="space-y-4">
                {[
                  { label: 'Channel ID', key: 'channelId', placeholder: 'e.g. 68719478279' },
                  { label: 'Channel name', key: 'channelName', placeholder: 'e.g. Fabrikam Online' },
                  { label: 'Domain name', key: 'domainName', placeholder: 'e.g. www.fabrikam.com' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs text-zinc-400 mb-1">{label}</label>
                    <input
                      value={(bindingForm as any)[key]}
                      onChange={(e) => setBindingForm({ ...bindingForm, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Locale</label>
                  <select
                    value={bindingForm.locale}
                    onChange={(e) => setBindingForm({ ...bindingForm, locale: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    {LOCALES.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={bindingForm.isPrimary} onChange={(e) => setBindingForm({ ...bindingForm, isPrimary: e.target.checked })} className="accent-blue-500" />
                  <span className="text-sm text-zinc-300">Set as primary binding</span>
                </label>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setBindingModal(false)} className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-sm font-medium">Cancel</button>
                  <button onClick={handleAddBinding} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium">Add binding</button>
                </div>
              </div>
            </Modal>
          </div>
        )}

        {/* ── TAB: Pages ── */}
        {tab === 'pages' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {['all', 'draft', 'published', 'scheduled'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPageStatusFilter(s)}
                    className={cn('px-3 py-1.5 text-xs rounded-md font-medium capitalize transition-colors',
                      pageStatusFilter === s ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200')}
                  >{s}</button>
                ))}
                <span className="w-px h-4 bg-zinc-700" />
                <select
                  value={pageTypeFilter}
                  onChange={(e) => setPageTypeFilter(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs rounded px-2 py-1.5 focus:outline-none"
                >
                  <option value="all">All types</option>
                  {PAGE_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <button
                onClick={() => setPageModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New page
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Page name', 'URL path', 'Type', 'Status', 'Published at', ''].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-zinc-400 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredPages.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-zinc-500 text-sm">No pages found.</td></tr>
                  ) : filteredPages.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 text-zinc-200 font-medium">{p.pageName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{p.urlPath}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-xs capitalize">{p.pageType}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {p.status === 'draft' && (
                            <button onClick={() => handlePublishPage(p.id)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Publish</button>
                          )}
                          {p.status === 'published' && (
                            <button onClick={() => handleUnpublishPage(p.id)} className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">Unpublish</button>
                          )}
                          <button onClick={() => handleDeletePage(p.id)} className="text-zinc-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Modal open={pageModal} onClose={() => setPageModal(false)} title="New page">
              <div className="space-y-4">
                {[
                  { label: 'Page name', key: 'pageName', placeholder: 'e.g. Home page' },
                  { label: 'Page ID', key: 'pageId', placeholder: 'e.g. home-page' },
                  { label: 'URL path', key: 'urlPath', placeholder: 'e.g. /' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs text-zinc-400 mb-1">{label}</label>
                    <input
                      value={(pageForm as any)[key]}
                      onChange={(e) => setPageForm({ ...pageForm, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Page type</label>
                  <select
                    value={pageForm.pageType}
                    onChange={(e) => setPageForm({ ...pageForm, pageType: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    {PAGE_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setPageModal(false)} className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-sm font-medium">Cancel</button>
                  <button onClick={handleAddPage} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium">Create page</button>
                </div>
              </div>
            </Modal>
          </div>
        )}

        {/* ── TAB: Authentication ── */}
        {tab === 'auth' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Authentication changes require a site republish to take effect.
              </div>
              <button
                onClick={() => setAuthModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add provider
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Provider name', 'Type', 'Client ID', 'Active', ''].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-zinc-400 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {site.authProviders.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-zinc-500 text-sm">No auth providers configured.</td></tr>
                  ) : site.authProviders.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 text-zinc-200 font-medium">{p.providerName}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs uppercase">{p.providerType}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                        {p.clientId ? `${p.clientId.slice(0, 8)}••••••••` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('w-2 h-2 rounded-full inline-block', p.isActive ? 'bg-emerald-400' : 'bg-zinc-600')} />
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDeleteAuth(p.id)} className="text-zinc-500 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Modal open={authModal} onClose={() => setAuthModal(false)} title="Add authentication provider">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Provider name</label>
                  <select
                    value={authForm.providerName}
                    onChange={(e) => setAuthForm({ ...authForm, providerName: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    {['Azure AD B2C', 'Microsoft', 'AAD', 'Local', 'Custom'].map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Provider type</label>
                  <select
                    value={authForm.providerType}
                    onChange={(e) => setAuthForm({ ...authForm, providerType: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    {['oauth2', 'oidc', 'saml'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Client ID</label>
                  <input
                    value={authForm.clientId}
                    onChange={(e) => setAuthForm({ ...authForm, clientId: e.target.value })}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Tenant ID</label>
                  <input
                    value={authForm.tenantId}
                    onChange={(e) => setAuthForm({ ...authForm, tenantId: e.target.value })}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setAuthModal(false)} className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-sm font-medium">Cancel</button>
                  <button onClick={handleAddAuth} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium">Add provider</button>
                </div>
              </div>
            </Modal>
          </div>
        )}

        {/* ── TAB: Deployments ── */}
        {tab === 'deployments' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Version', 'Deployed by', 'Date', 'Status', 'Notes', ''].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-zinc-400 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {site.deployments.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-zinc-500 text-sm">No deployments yet.</td></tr>
                ) : site.deployments.map((d) => (
                  <tr key={d.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-300">{d.version ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{d.deployedBy ?? 'System'}</td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{new Date(d.deployedAt).toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{d.notes ?? '—'}</td>
                    <td className="px-4 py-3">
                      {d.status === 'live' && (
                        <button className="text-xs text-zinc-400 hover:text-amber-400 transition-colors">Rollback</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
