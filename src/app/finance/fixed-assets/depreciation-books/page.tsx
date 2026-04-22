export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { Plus } from 'lucide-react'

const METHOD_COLORS: Record<string, string> = {
  'Straight-Line':          'bg-blue-500/10 text-blue-400',
  'Declining Balance':      'bg-amber-500/10 text-amber-400',
  'Declining Balance 2':    'bg-orange-500/10 text-orange-400',
  'Sum of Years Digits':    'bg-purple-500/10 text-purple-400',
  'Units of Production':    'bg-emerald-500/10 text-emerald-400',
}

const SAMPLE_BOOKS = [
  { id: '1', code: 'BOOK-TAX',  description: 'Tax Depreciation Book',      method: 'Declining Balance',   fiscalYear: 'Dec 31', taxBook: true  },
  { id: '2', code: 'BOOK-GAAP', description: 'GAAP Financial Reporting',   method: 'Straight-Line',        fiscalYear: 'Dec 31', taxBook: false },
  { id: '3', code: 'BOOK-IFRS', description: 'IFRS Reporting Book',        method: 'Straight-Line',        fiscalYear: 'Dec 31', taxBook: false },
  { id: '4', code: 'BOOK-ALT',  description: 'Alternative Min Tax (AMT)',  method: 'Declining Balance 2',  fiscalYear: 'Dec 31', taxBook: true  },
]

export default function DepreciationBooksPage() {
  return (
    <>
      <TopBar
        title="Depreciation Books"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Fixed Assets', href: '/finance/fixed-assets' },
        ]}
        actions={
          <Link
            href="/finance/fixed-assets/depreciation-books/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </Link>
        }
      />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Books</div>
            <div className="text-2xl font-bold text-zinc-100">{SAMPLE_BOOKS.length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Tax Books</div>
            <div className="text-2xl font-bold text-amber-400">{SAMPLE_BOOKS.filter(b => b.taxBook).length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Financial Books</div>
            <div className="text-2xl font-bold text-blue-400">{SAMPLE_BOOKS.filter(b => !b.taxBook).length}</div>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Code</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Depreciation Method</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Fiscal Year End</th>
                <th className="text-center px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Tax Book</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_BOOKS.map((book, idx) => (
                <tr key={book.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== SAMPLE_BOOKS.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-blue-400">{book.code}</td>
                  <td className="px-4 py-2.5 text-zinc-200">{book.description}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${METHOD_COLORS[book.method] ?? 'bg-zinc-700 text-zinc-400'}`}>
                      {book.method}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{book.fiscalYear}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`w-2 h-2 rounded-full inline-block ${book.taxBook ? 'bg-amber-400' : 'bg-zinc-600'}`} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link href={`/finance/fixed-assets/depreciation-books/${book.id}`} className="text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-[12px] text-zinc-500">{SAMPLE_BOOKS.length} depreciation books</div>
      </div>
    </>
  )
}
