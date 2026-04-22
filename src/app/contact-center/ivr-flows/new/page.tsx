'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

type IvrNode = {
  stepNo: number
  nodeType: string
  configJson: string
}

const NODE_TYPES = ['Menu', 'Message', 'Transfer', 'CollectInput', 'Queue']
const LANGUAGES = ['en-US', 'es-US', 'fr-FR', 'de-DE', 'pt-BR', 'zh-CN', 'ja-JP']
const AFTER_HOURS_ACTIONS = ['Voicemail', 'Disconnect', 'Transfer']

export default function NewIvrFlowPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [language, setLanguage] = useState('en-US')
  const [defaultQueue, setDefaultQueue] = useState('')
  const [maxWaitTime, setMaxWaitTime] = useState(300)
  const [afterHoursAction, setAfterHoursAction] = useState('Voicemail')

  const [nodes, setNodes] = useState<IvrNode[]>([
    { stepNo: 1, nodeType: 'Message', configJson: '{}' },
  ])

  const addNode = () => setNodes(prev => [...prev, { stepNo: prev.length + 1, nodeType: 'Message', configJson: '{}' }])
  const removeNode = (i: number) => setNodes(prev => prev.filter((_, idx) => idx !== i).map((n, idx) => ({ ...n, stepNo: idx + 1 })))
  const updateNode = (i: number, field: keyof IvrNode, value: string | number) =>
    setNodes(prev => prev.map((n, idx) => idx === i ? { ...n, [field]: value } : n))

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/contact-center/ivr-flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phoneNumber: phoneNumber || null,
          status: 'draft',
          stepsJson: JSON.stringify({ language, defaultQueue, maxWaitTime, afterHoursAction, nodes }),
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const flow = await res.json()

      // Save nodes
      for (const node of nodes) {
        await fetch('/api/contact-center/ivr-flows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flowId: flow.id, ...node }),
        }).catch(() => {})
      }

      router.push('/contact-center/ivr-flows')
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      {/* TopBar */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/contact-center" className="hover:text-white transition-colors">Contact Center</Link>
          <span>/</span>
          <Link href="/contact-center/ivr-flows" className="hover:text-white transition-colors">IVR Flows</Link>
          <span>/</span>
          <span className="text-white font-medium">New IVR Flow</span>
        </div>
      </div>

      {/* Action Ribbon */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-2 flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs px-4 py-1.5 rounded transition-colors font-medium"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <Link href="/contact-center/ivr-flows">
          <button className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors">
            Discard
          </button>
        </Link>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded text-sm">{error}</div>
      )}

      <div className="p-6 max-w-4xl space-y-6">
        {/* General FastTab */}
        <div className="bg-[#16213e] rounded-lg border border-slate-700/50">
          <div className="px-5 py-3 border-b border-slate-700/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <h3 className="font-semibold text-sm text-white">General</h3>
          </div>
          <div className="p-5 grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Flow Name <span className="text-red-400">*</span></label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Main IVR Tree"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone Number (Entry Point)</label>
              <input
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="+1-800-555-0100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Default Queue</label>
              <input
                value={defaultQueue}
                onChange={e => setDefaultQueue(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="Queue name or ID"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Max Wait Time (seconds)</label>
              <input
                type="number"
                value={maxWaitTime}
                onChange={e => setMaxWaitTime(Number(e.target.value))}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                min={0}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">After Hours Action</label>
              <select
                value={afterHoursAction}
                onChange={e => setAfterHoursAction(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {AFTER_HOURS_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Flow Nodes FastTab */}
        <div className="bg-[#16213e] rounded-lg border border-slate-700/50">
          <div className="px-5 py-3 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <h3 className="font-semibold text-sm text-white">Flow Nodes</h3>
            </div>
            <button
              onClick={addNode}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded transition-colors"
            >
              + Add Node
            </button>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-400 uppercase">Step No.</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-400 uppercase">Node Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-400 uppercase">Configuration (JSON)</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {nodes.map((node, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-slate-400 text-xs">{node.stepNo}</td>
                    <td className="px-3 py-2">
                      <select
                        value={node.nodeType}
                        onChange={e => updateNode(i, 'nodeType', e.target.value)}
                        className="bg-[#0f0f1a] border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        {NODE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={node.configJson}
                        onChange={e => updateNode(i, 'configJson', e.target.value)}
                        className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                        placeholder='{"prompt":"Press 1 for..."}'
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => removeNode(i)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
