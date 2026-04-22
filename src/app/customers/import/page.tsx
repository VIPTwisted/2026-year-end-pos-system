'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, CheckCircle, AlertTriangle, Download } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'

interface ImportResult {
  imported: number
  updated: number
  errors: { row: number; message: string }[]
}

function downloadTemplate() {
  const headers = 'firstName,lastName,email,phone,address,city,state,zip,notes,loyaltyPoints,isActive'
  const row1 = 'Jane,Doe,jane.doe@example.com,555-123-4567,123 Main St,Springfield,IL,62701,VIP customer,150,true'
  const row2 = 'John,Smith,john.smith@example.com,555-987-6543,456 Oak Ave,Chicago,IL,60601,,0,true'
  const csv = [headers, row1, row2].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'customer-import-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function CustomerImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.csv')) {
      setError('Only .csv files are accepted.')
      return
    }
    setFile(f)
    setResult(null)
    setError(null)
  }

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
  }

  const onDragLeave = () => setDragging(false)

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const handleImport = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/customers/import', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json() as ImportResult | { error: string }

      if (!res.ok || 'error' in json) {
        setError('error' in json ? json.error : 'Import failed')
      } else {
        setResult(json)
      }
    } catch {
      setError('Network error — import failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="Import Customers" />
      <main className="flex-1 p-6 bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Back link */}
          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Customers
          </Link>

          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Bulk Import Customers</h1>
            <p className="text-[13px] text-zinc-500 mt-1">
              Upload a CSV file to create or update customer records. Existing customers are matched by email.
            </p>
          </div>

          {/* Instructions card */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">CSV Format</h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-500 mb-2">Required (one of)</p>
                <ul className="space-y-1">
                  {['firstName', 'lastName'].map(f => (
                    <li key={f} className="text-[13px] text-zinc-300 font-mono">{f}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Optional</p>
                <ul className="space-y-1">
                  {['email', 'phone', 'address', 'city', 'state', 'zip', 'notes', 'loyaltyPoints', 'isActive'].map(f => (
                    <li key={f} className="text-[13px] text-zinc-400 font-mono">{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-zinc-800/60 pt-4 space-y-1.5 text-[12px] text-zinc-500">
              <p>• <span className="text-zinc-400">email</span> — used as unique key; existing customers with matching email are updated</p>
              <p>• <span className="text-zinc-400">loyaltyPoints</span> — integer (e.g. 150)</p>
              <p>• <span className="text-zinc-400">isActive</span> — true / false / 1 / 0 (default: true)</p>
            </div>

            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 text-[13px] text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Template CSV
            </button>
          </div>

          {/* Upload zone */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => inputRef.current?.click()}
            className={`bg-[#16213e] border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors
              ${dragging ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-700 hover:border-zinc-500'}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={onInputChange}
            />
            <Upload className={`w-8 h-8 ${dragging ? 'text-blue-400' : 'text-zinc-600'}`} />
            {file ? (
              <div className="text-center">
                <p className="text-[13px] font-medium text-zinc-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  {file.name}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB — click or drag to replace
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-[13px] text-zinc-400">Drag &amp; drop your CSV here</p>
                <p className="text-[12px] text-zinc-600 mt-0.5">or click to browse</p>
              </div>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-[13px] text-red-400">{error}</p>
            </div>
          )}

          {/* Import button */}
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="w-full h-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Importing…' : 'Import Customers'}
          </button>

          {/* Result card */}
          {result && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              {/* Summary row */}
              <div className="flex items-center gap-4 px-5 py-4 border-b border-zinc-800/60">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="flex gap-6">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Created</p>
                    <p className="text-xl font-bold text-emerald-400 tabular-nums">{result.imported}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Updated</p>
                    <p className="text-xl font-bold text-blue-400 tabular-nums">{result.updated}</p>
                  </div>
                  {result.errors.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Errors</p>
                      <p className="text-xl font-bold text-red-400 tabular-nums">{result.errors.length}</p>
                    </div>
                  )}
                </div>
                <div className="ml-auto">
                  <Link
                    href="/customers"
                    className="text-[13px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    View All Customers →
                  </Link>
                </div>
              </div>

              {/* Errors table */}
              {result.errors.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-zinc-800/60 text-zinc-500 text-[11px] uppercase tracking-wide">
                        <th className="text-left px-5 py-2.5 font-medium w-20">Row</th>
                        <th className="text-left py-2.5 pr-5 font-medium">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((err, i) => (
                        <tr
                          key={i}
                          className={`${i < result.errors.length - 1 ? 'border-b border-zinc-800/40' : ''}`}
                        >
                          <td className="px-5 py-2.5 font-mono text-zinc-500">#{err.row}</td>
                          <td className="py-2.5 pr-5 text-red-400">{err.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </>
  )
}
