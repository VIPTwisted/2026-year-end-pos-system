'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Barcode, Plus, Trash2, Save, Loader2 } from 'lucide-react'

const inputCls = 'w-full bg-zinc-900 border border-zinc-700/60 rounded px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors'
const labelCls = 'block text-[11px] font-medium text-zinc-500 mb-1 uppercase tracking-wide'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-zinc-700'}`}>
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

interface UomBarcode { id: string; itemNo: string; uomCode: string; barcode: string; qtyPerUom: string }

interface Settings {
  defaultBarcodeFormat: string
  barcodeSeparator: string
  countryOfOriginCode: string
  autoSearchOnScan: boolean
  openItemCardOnSingleMatch: boolean
  showMultipleResults: boolean
  requireConfirmation: boolean
  labelFormat: string
  printOnReceipt: boolean
  autoPrintOnNewItem: boolean
}

const DEFAULT_SETTINGS: Settings = {
  defaultBarcodeFormat: 'EAN-13',
  barcodeSeparator: '',
  countryOfOriginCode: 'US',
  autoSearchOnScan: true,
  openItemCardOnSingleMatch: true,
  showMultipleResults: true,
  requireConfirmation: false,
  labelFormat: '4x6',
  printOnReceipt: false,
  autoPrintOnNewItem: false,
}

export default function BarcodeSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [uomBarcodes, setUomBarcodes] = useState<UomBarcode[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/settings/barcode')
      .then(r => r.json())
      .then(data => {
        if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings })
        if (data.uomBarcodes) setUomBarcodes(data.uomBarcodes)
      })
      .catch(() => {})
  }, [])

  function setSetting<K extends keyof Settings>(key: K, val: Settings[K]) {
    setSettings(prev => ({ ...prev, [key]: val }))
  }

  function setUom(idx: number, field: keyof UomBarcode, val: string) {
    setUomBarcodes(prev => prev.map((row, i) => i === idx ? { ...row, [field]: val } : row))
  }

  function addUomRow() {
    setUomBarcodes(prev => [...prev, { id: `new-${Date.now()}`, itemNo: '', uomCode: '', barcode: '', qtyPerUom: '1' }])
  }

  function removeUomRow(idx: number) {
    setUomBarcodes(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSave() {
    setError('')
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/settings/barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, uomBarcodes }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Save failed')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const sectionHead = (title: string) => (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">{title}</span>
      <div className="flex-1 h-px bg-zinc-800/60" />
    </div>
  )

  return (
    <>
      <TopBar title="Barcode Settings" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Action Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2 flex items-center gap-1">
          <div className="flex items-center gap-2 mr-auto">
            <Barcode className="w-4 h-4 text-zinc-500" />
            <span className="text-[13px] font-semibold text-zinc-200">Barcode Setup</span>
          </div>
          {saved && <span className="text-[12px] text-emerald-400 mr-3">Settings saved.</span>}
          {error && <span className="text-[12px] text-red-400 mr-3">{error}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded transition-colors">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>

        <div className="px-6 py-5 max-w-3xl space-y-6">

          {/* GS1 Settings */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            {sectionHead('GS1 Settings')}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelCls}>Default Barcode Format</label>
                <select value={settings.defaultBarcodeFormat} onChange={e => setSetting('defaultBarcodeFormat', e.target.value)} className={inputCls}>
                  <option value="EAN-13">EAN-13</option>
                  <option value="UPC-A">UPC-A</option>
                  <option value="QR Code">QR Code</option>
                  <option value="Code128">Code 128</option>
                  <option value="Data Matrix">Data Matrix</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Barcode Separator</label>
                <input
                  value={settings.barcodeSeparator}
                  onChange={e => setSetting('barcodeSeparator', e.target.value)}
                  placeholder="e.g. - or /"
                  maxLength={3}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Country of Origin Code</label>
                <input
                  value={settings.countryOfOriginCode}
                  onChange={e => setSetting('countryOfOriginCode', e.target.value.toUpperCase())}
                  placeholder="e.g. US"
                  maxLength={3}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Scan Rules */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            {sectionHead('Scan Rules')}
            <div className="space-y-4">
              {([
                { key: 'autoSearchOnScan', label: 'Auto-Search on Scan', desc: 'Automatically trigger item search when a barcode is scanned' },
                { key: 'openItemCardOnSingleMatch', label: 'Open Item Card on Single Match', desc: 'Navigate directly to item card if only one result is found' },
                { key: 'showMultipleResults', label: 'Show Multiple Results', desc: 'Display a results list when multiple items match the barcode' },
                { key: 'requireConfirmation', label: 'Require Confirmation', desc: 'Show a confirmation prompt before adding scanned item to transaction' },
              ] as Array<{ key: keyof Settings; label: string; desc: string }>).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] text-zinc-200 font-medium">{label}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{desc}</p>
                  </div>
                  <Toggle
                    checked={settings[key] as boolean}
                    onChange={v => setSetting(key, v as Settings[typeof key])}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* UOM Barcodes Table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            {sectionHead('Unit of Measure Barcodes')}
            <div className="mb-3">
              <button
                onClick={addUomRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded transition-colors">
                <Plus className="w-3.5 h-3.5" /> New Row
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/40">
                    {['Item No.', 'UOM Code', 'Barcode', 'Qty per UOM', ''].map(h => (
                      <th key={h} className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pr-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uomBarcodes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[13px] text-zinc-600">
                        No UOM barcodes configured. Click &ldquo;New Row&rdquo; to add one.
                      </td>
                    </tr>
                  ) : uomBarcodes.map((row, idx) => (
                    <tr key={row.id} className="border-b border-zinc-800/30 last:border-0">
                      <td className="py-2 pr-3">
                        <input value={row.itemNo} onChange={e => setUom(idx, 'itemNo', e.target.value)}
                          placeholder="Item No." className={inputCls} />
                      </td>
                      <td className="py-2 pr-3">
                        <input value={row.uomCode} onChange={e => setUom(idx, 'uomCode', e.target.value.toUpperCase())}
                          placeholder="EA" maxLength={10} className={inputCls} />
                      </td>
                      <td className="py-2 pr-3">
                        <input value={row.barcode} onChange={e => setUom(idx, 'barcode', e.target.value)}
                          placeholder="0123456789012" className={inputCls} />
                      </td>
                      <td className="py-2 pr-3">
                        <input value={row.qtyPerUom} onChange={e => setUom(idx, 'qtyPerUom', e.target.value)}
                          type="number" min="0.001" step="0.001" placeholder="1" className={inputCls} />
                      </td>
                      <td className="py-2">
                        <button onClick={() => removeUomRow(idx)}
                          className="text-zinc-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Label Settings */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            {sectionHead('Label Settings')}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelCls}>Label Format</label>
                <select value={settings.labelFormat} onChange={e => setSetting('labelFormat', e.target.value)} className={inputCls}>
                  <option value="4x6">4 × 6 in</option>
                  <option value="2x4">2 × 4 in</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div className="flex flex-col gap-4 pt-1">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] text-zinc-200 font-medium">Print on Receipt</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Attach barcode label to receipt printout</p>
                  </div>
                  <Toggle checked={settings.printOnReceipt} onChange={v => setSetting('printOnReceipt', v)} />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] text-zinc-200 font-medium">Auto-Print on New Item</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Automatically print barcode label when new item is created</p>
                  </div>
                  <Toggle checked={settings.autoPrintOnNewItem} onChange={v => setSetting('autoPrintOnNewItem', v)} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pb-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>

        </div>
      </main>
    </>
  )
}
