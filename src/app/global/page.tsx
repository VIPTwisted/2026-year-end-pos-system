'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Globe2, DollarSign, Receipt, Languages, Type, Map, RefreshCw, TrendingUp, CheckCircle } from 'lucide-react'

interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  isBase: boolean
  isActive: boolean
  exchangeRates: { toCurrencyCode: string; rate: number; effectiveDate: string }[]
  updatedAt: string
}

interface Stats {
  currencies: number
  languages: number
  taxRegions: number
  countries: number
}

export default function GlobalCommerceHub() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [stats, setStats] = useState<Stats>({ currencies: 0, languages: 0, taxRegions: 0, countries: 0 })
  const [refreshing, setRefreshing] = useState(false)
  const [refreshMsg, setRefreshMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const [cRes, lRes, tRes, coRes] = await Promise.all([
      fetch('/api/global/currencies'),
      fetch('/api/global/languages'),
      fetch('/api/global/tax-regions'),
      fetch('/api/global/countries'),
    ])
    const [cData, lData, tData, coData] = await Promise.all([
      cRes.json(), lRes.json(), tRes.json(), coRes.json()
    ])
    setCurrencies(Array.isArray(cData) ? cData : [])
    setStats({
      currencies: Array.isArray(cData) ? cData.filter((c: Currency) => c.isActive).length : 0,
      languages: Array.isArray(lData) ? lData.filter((l: { isActive: boolean }) => l.isActive).length : 0,
      taxRegions: Array.isArray(tData) ? tData.filter((t: { isActive: boolean }) => t.isActive).length : 0,
      countries: Array.isArray(coData) ? coData.filter((c: { isActive: boolean }) => c.isActive).length : 0,
    })
    setLoading(false)
  }

  async function handleRefresh() {
    setRefreshing(true)
    setRefreshMsg('')
    const res = await fetch('/api/global/currencies/refresh', { method: 'POST' })
    const data = await res.json()
    setRefreshMsg(`Updated ${data.updated} rates`)
    await fetchAll()
    setRefreshing(false)
  }

  const baseCurrency = currencies.find(c => c.isBase)
  const activeCurrencies = currencies.filter(c => c.isActive)

  const quickLinks = [
    { href: '/global/currencies', label: 'Currencies', icon: DollarSign, desc: 'Manage currency codes & rates' },
    { href: '/global/tax-regions', label: 'Tax Regions', icon: Receipt, desc: 'VAT/GST/sales tax by region' },
    { href: '/global/languages', label: 'Languages', icon: Languages, desc: 'Supported UI languages' },
    { href: '/global/translations', label: 'Translations', icon: Type, desc: 'String translations by language' },
    { href: '/global/countries', label: 'Countries', icon: Map, desc: 'Country-level configuration' },
  ]

  const kpis = [
    { label: 'Active Currencies', value: stats.currencies, icon: DollarSign, color: 'text-blue-400' },
    { label: 'Languages', value: stats.languages, icon: Languages, color: 'text-emerald-400' },
    { label: 'Tax Regions', value: stats.taxRegions, icon: Receipt, color: 'text-amber-400' },
    { label: 'Country Configs', value: stats.countries, icon: Map, color: 'text-violet-400' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
            <Globe2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Global Commerce Hub</h1>
            <p className="text-sm text-zinc-500">Multi-currency, tax, language & country management</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Rates
        </button>
      </div>

      {refreshMsg && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/30 border border-emerald-700/50 rounded-lg text-emerald-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          {refreshMsg}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <k.icon className={`w-4 h-4 ${k.color}`} />
              <span className="text-xs text-zinc-500">{k.label}</span>
            </div>
            <div className={`text-3xl font-bold ${k.color}`}>
              {loading ? '—' : k.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-zinc-300">Base Currency</h2>
          </div>
          {baseCurrency ? (
            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-zinc-100">{baseCurrency.symbol}</span>
                <span className="text-2xl font-semibold text-blue-400">{baseCurrency.code}</span>
              </div>
              <p className="text-zinc-400 text-sm">{baseCurrency.name}</p>
              <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600/20 border border-blue-600/30 rounded text-blue-400 text-xs font-medium">
                Base Currency
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">No base currency set. Go to Currencies to configure one.</p>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-300">Exchange Rates vs {baseCurrency?.code ?? 'Base'}</h2>
          </div>
          {loading ? (
            <p className="text-zinc-600 text-sm">Loading...</p>
          ) : activeCurrencies.filter(c => !c.isBase).length === 0 ? (
            <p className="text-zinc-600 text-sm">No exchange rates configured.</p>
          ) : (
            <div className="space-y-2">
              {activeCurrencies.filter(c => !c.isBase).slice(0, 6).map(c => {
                const latestRate = c.exchangeRates?.[0]
                return (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-100 font-medium w-10">{c.code}</span>
                      <span className="text-zinc-500">{c.name}</span>
                    </div>
                    <div className="text-right">
                      {latestRate ? (
                        <span className="text-emerald-400 font-mono">{latestRate.rate.toFixed(4)}</span>
                      ) : (
                        <span className="text-zinc-600">No rate</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Modules</h2>
        <div className="grid grid-cols-5 gap-3">
          {quickLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 group transition-colors"
            >
              <link.icon className="w-5 h-5 text-zinc-400 group-hover:text-blue-400 mb-3 transition-colors" />
              <div className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100 mb-1">{link.label}</div>
              <div className="text-xs text-zinc-600">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
