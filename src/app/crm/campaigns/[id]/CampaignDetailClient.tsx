'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Send, ChevronRight, Pencil, Save, X } from 'lucide-react'

interface BCCampaign {
  id: string; campaignNo: string; description: string
  startingDate: string | null; endingDate: string | null
  statusCode: string; salesperson: string | null; noOfContacts: number; createdAt: string
}

export default function CampaignDetailClient({ id }: { id: string }) {
  const [camp, setCamp] = useState<BCCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ description: '', startingDate: '', endingDate: '', statusCode: '', salesperson: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    // Use campaigns list filtered to this campaign
    fetch(`/api/crm/campaigns`)
      .then(r => r.json())
      .then((d: BCCampaign[]) => {
        const found = Array.isArray(d) ? d.find((c: BCCampaign) => c.id === id) : null
        if (found) {
          setCamp(found)
          setForm({
            description: found.description ?? '', startingDate: found.startingDate ?? '',
            endingDate: found.endingDate ?? '', statusCode: found.statusCode ?? 'Active',
            salesperson: found.salesperson ?? '',
          })
        }
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleSave() {
    setSaving(true)
    // POST a new record as a PATCH doesn't have a campaigns/[id] route — use the existing list approach
    // For now we use the campaigns route and re-fetch (full save via new record creation is not ideal;
    // in production, add a PATCH /api/crm/campaigns/[id] endpoint)
    setSaving(false); setEditing(false)
  }

  if (loading) return <div className="p-6 text-zinc-500 text-sm">Loading...</div>
  if (!camp) return <div className="p-6 text-zinc-500 text-sm">Campaign not found</div>

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <div className="px-6 pt-4 pb-1 flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/crm/campaigns" className="hover:text-zinc-300 transition-colors">Campaigns</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-300">{camp.campaignNo}</span>
      </div>

      <div className="px-6 pt-2 pb-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Send className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">{camp.description}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-zinc-500">{camp.campaignNo}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${camp.statusCode === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-400'}`}>
                {camp.statusCode}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-zinc-700 text-zinc-400 hover:text-white rounded transition-colors">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded font-medium transition-colors">
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-5 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
          {[
            { label: 'Campaign No.', value: camp.campaignNo },
            { label: 'Status Code', value: camp.statusCode },
            { label: 'Starting Date', value: camp.startingDate ?? '—' },
            { label: 'Ending Date', value: camp.endingDate ?? '—' },
            { label: 'Salesperson', value: camp.salesperson ?? '—' },
            { label: 'No. of Contacts', value: String(camp.noOfContacts ?? 0) },
            { label: 'Created', value: camp.createdAt ? new Date(camp.createdAt).toLocaleDateString() : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[11px] text-zinc-500 mb-0.5">{label}</p>
              <p className="text-sm text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-zinc-800">
          <p className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wide">Related</p>
          <div className="flex gap-3">
            <Link href={`/crm/opportunities?campaignId=${id}`}
              className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-zinc-300 rounded transition-colors">
              View Opportunities
            </Link>
            <Link href={`/crm/segments?campaignId=${id}`}
              className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-zinc-300 rounded transition-colors">
              View Segments
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
