'use client'
import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ArrowLeft, Upload, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react'

interface ImportError {
  row: number
  message: string
}

interface ImportResult {
  imported: number
  updated: number
  errors: ImportError[]
}

const TEMPLATE_HEADERS = [
  'name',
  'sku',
  'barcode',
  'description',
  'price',
  'costPrice',
  'category',
  'supplier',
  'reorderPoint',
  'minAge',
  'requiresSerial',
]

const TEMPLATE_ROWS = [
  ['Blue Widget', 'WDGT-001', '012345678901', 'A sturdy blue widget', '19.99', '9.50', 'Widgets', 'Acme Corp', '10', '0', 'false'],
  ['Red Gadget', 'GDGT-002', '012345678902', 'Premium red gadget', '49.99', '22.00', 'Gadgets', '', '5', '18', 'true'],
]

function downloadTemplate() {
  const rows = [TEMPLATE_HEADERS, ...TEMPLATE_ROWS]
  const csv = rows.map(r => r.map(v => (v.includes(',') ? `"${v}"` : v)).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'products-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function ProductImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File | null) => {
    if (!f) return
    if (!f.name.endsWith('.csv') && f.type !== 'text/csv') {
      setApiError('Please upload a .csv file.')
      return
    }
    setFile(f)
    setResult(null)
    setApiError(null)
  }, [])

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] ?? null)
  }

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
  }

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0] ?? null)
  }

  const handleImport = async () => {
    if (!file) return
    setLoading(true)
    setApiError(null)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/products/import', {
        method: 'POST',
        body: formData,
      })
      const data: unknown = await res.json()
      if (!res.ok) {
        const errData = data as { error?: string }
        setApiError(errData?.error ?? 'Import failed')
        return
      }
      setResult(data as ImportResult)
    } catch {
      setApiError('Network error — could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar
        title="Import Products"
        breadcrumb={[{ label: 'Products', href: '/products' }]}
      />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-2xl mx-auto p-6 space-y-6">

          {/* Back link */}
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Products
          </Link>

          {/* Instructions card */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">
              Instructions
            </div>
            <p className="text-[13px] text-zinc-300 mb-4">
              Download the template CSV, fill in your products, then upload below.
              Categories will be created if they don&apos;t exist. Suppliers must already exist
              in the system (unmatched supplier names are skipped). Products are matched
              by SKU — existing products will be updated, new SKUs will be created.
            </p>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 h-8 px-4 rounded text-[12px] font-medium bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-zinc-100 hover:border-zinc-600 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Template CSV
            </button>
          </div>

          {/* Upload section */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Upload CSV
            </div>

            {/* Drag-and-drop zone */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`
                flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed
                cursor-pointer transition-colors py-10 px-6 text-center
                ${dragging
                  ? 'border-blue-500 bg-blue-500/5'
                  : 'border-zinc-700/60 hover:border-zinc-600 hover:bg-zinc-800/20'}
              `}
            >
              <Upload className={`w-8 h-8 ${dragging ? 'text-blue-400' : 'text-zinc-600'}`} />
              <div>
                <p className="text-[13px] text-zinc-300">
                  {dragging ? 'Drop your CSV here' : 'Drag & drop a CSV file, or click to browse'}
                </p>
                <p className="text-[11px] text-zinc-600 mt-0.5">Accepts .csv files only</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={onInputChange}
              />
            </div>

            {/* Selected file display */}
            {file && (
              <div className="flex items-center gap-2 px-3 py-2 rounded bg-zinc-800/50 border border-zinc-700/50">
                <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-[13px] text-zinc-200 truncate">{file.name}</span>
                <span className="text-[11px] text-zinc-500 shrink-0">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            )}

            {/* API error */}
            {apiError && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded bg-red-500/10 border border-red-800/40">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[12px] text-red-400">{apiError}</p>
              </div>
            )}

            {/* Import button */}
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="w-full h-9 rounded text-[13px] font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Importing…' : 'Import Products'}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Success summary */}
              <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-lg bg-emerald-500/10 border border-emerald-800/40">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-medium text-emerald-300">
                    Import complete
                  </p>
                  <p className="text-[12px] text-emerald-400/80 mt-0.5">
                    {result.imported} product{result.imported !== 1 ? 's' : ''} imported
                    {result.updated > 0 && `, ${result.updated} updated`}
                  </p>
                </div>
              </div>

              {/* Errors table */}
              {result.errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-800/40 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-red-800/30">
                    <p className="text-[12px] font-semibold text-red-400 uppercase tracking-widest">
                      {result.errors.length} Row Error{result.errors.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-red-800/20">
                          <th className="text-left text-[10px] uppercase tracking-widest text-red-500/70 px-4 py-2 font-medium w-16">Row</th>
                          <th className="text-left text-[10px] uppercase tracking-widest text-red-500/70 px-4 py-2 font-medium">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.errors.map((err, idx) => (
                          <tr key={idx} className="border-b border-red-800/20 last:border-0">
                            <td className="px-4 py-2 text-[12px] font-mono text-red-400">{err.row}</td>
                            <td className="px-4 py-2 text-[12px] text-red-300">{err.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* View all products link */}
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                View All Products
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
