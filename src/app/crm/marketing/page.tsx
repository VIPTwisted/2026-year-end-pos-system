'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Megaphone, Send, Users, Mail, UserPlus, CalendarDays, TrendingUp, Target, BarChart3, ArrowRight } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  campaignType: string
  status: string
  totalRecipients: number
  delivered: number
  opened: number
  clicked: number
  converted: number
  revenue: number
  createdAt: string
}

interface Lead { id: string; status: string; createdAt: string; score: number }
interface Event { id: string; startDate?: string }

const TYPE_COLORS: Record<string, string> = {
  email: 'bg-blue-500/20 text-blue-400',
  sms: 'bg-green-500/20 text-green-400',
  push: 'bg-purple-500/20 text-purple-400',
  'in-store': 'bg-orange-500/20 text-orange-400',
  social: 'bg-pink-500/20 text-pink-400',
  'multi-channel': 'bg-cyan-500/20 text-cyan-400',
}
const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  scheduled: 'bg-yellow-500/20 text-yellow-400',
  active: 'bg-green-500/20 text-green-400',
  paused: 'bg-orange-500/20 text-orange-400',
  completed: 'bg-blue-500/20 text-blue-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

function pct(a: number, b: number) { return b > 0 ? ((a / b) * 100).toFixed(1) : '0.0' }

export default function MarketingHub() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/crm/campaigns').then(r => r.json()),
      fetch('/api/crm/leads').then(r => r.json()),
      fetch('/api/crm/events').then(r => r.json()),
    ]).then(([c, l, e]) => {
      setCampaigns(Array.isArray(c) ? c : [])
      setLeads(Array.isArray(l) ? l : [])
      setEvents(Array.isArray(e) ? e : [])
      setLoading(false)
    })
  }, [])

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalLeads = leads.length
  const converted = leads.filter(l => l.status === 'converted').length
  const convRate = leads.length > 0 ? ((converted / leads.length) * 100).toFixed(1) : '0.0'
  const completedCampaigns = campaigns.filter(c => c.status === 'completed')
  const totalRevenue = completedCampaigns.reduce((s, c) => s + c.revenue, 0)
  const totalSpend = completedCampaigns.reduce((s, c) => s + (c as unknown as { spend: number }).spend, 0)
  const avgROAS = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '0.00'
  const now = new Date()
  const eventsThisMonth = events.filter(e => {
    if (!e.startDate) return false
    const d = new Date(e.startDate)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const recent5 = [...campaigns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  const kpis = [
    { label: 'Active Campaigns', value: activeCampaigns, icon: Megaphone, color: 'text-blue-400' },
    { label: 'Total Leads', value: totalLeads, icon: UserPlus, color: 'text-green-400' },
    { label: 'Conversion Rate', value: `${convRate}%`, icon: Target, color: 'text-yellow-400' },
    { label: 'Avg ROAS', value: `${avgROAS}x`, icon: TrendingUp, color: 'text-purple-400' },
    { label: 'Events This Month', value: eventsThisMonth, icon: CalendarDays, color: 'text-cyan-400' },
  ]

  const quickLinks = [
    { label: 'Campaigns', href: '/crm/campaigns', icon: Send, desc: 'Email, SMS & multi-channel' },
    { label: 'Segments', href: '/crm/segments', icon: Users, desc: 'Customer segments & lists' },
    { label: 'Email Templates', href: '/crm/templates', icon: Mail, desc: 'Reusable message templates' },
    { label: 'Leads', href: '/crm/leads', icon: UserPlus, desc: 'Lead pipeline & scoring' },
    { label: 'Events', href: '/crm/events', icon: CalendarDays, desc: 'Webinars, pop-ups, VIP events' },
  ]

  return (
    <div className="p-6 space-y-6 min-h-[100dvh] bg-zinc-950">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-400" /> Marketing Hub
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Dynamics 365 Customer Insights · Marketing Hub</p>
        </div>
        <Link href="/crm/campaigns/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Send className="w-4 h-4" /> New Campaign
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <k.icon className={`w-4 h-4 ${k.color}`} />
              <span className="text-xs text-zinc-500">{k.label}</span>
            </div>
            <div className="text-2xl font-bold text-zinc-100">
              {loading ? <span className="text-zinc-600 animate-pulse">—</span> : k.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" /> Recent Campaign Performance
          </h2>
          <Link href="/crm/campaigns" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
            All campaigns <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Campaign', 'Type', 'Status', 'Recipients', 'Delivered', 'Open Rate', 'Click Rate', 'Revenue'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>
              ) : recent5.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">No campaigns yet</td></tr>
              ) : recent5.map(c => (
                <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/crm/campaigns/${c.id}`} className="text-zinc-100 hover:text-blue-400 font-medium">{c.name}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[c.campaignType] ?? 'bg-zinc-700 text-zinc-300'}`}>
                      {c.campaignType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[c.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{c.totalRecipients.toLocaleString()}</td>
                  <td className="px-4 py-3 text-zinc-300">{pct(c.delivered, c.totalRecipients)}%</td>
                  <td className="px-4 py-3 text-zinc-300">{pct(c.opened, c.delivered)}%</td>
                  <td className="px-4 py-3 text-zinc-300">{pct(c.clicked, c.opened)}%</td>
                  <td className="px-4 py-3 text-zinc-100 font-medium">${c.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickLinks.map(ql => (
            <Link key={ql.href} href={ql.href}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 flex flex-col gap-2 transition-all group">
              <ql.icon className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
              <div>
                <div className="text-sm font-semibold text-zinc-100 group-hover:text-white">{ql.label}</div>
                <div className="text-xs text-zinc-500">{ql.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
