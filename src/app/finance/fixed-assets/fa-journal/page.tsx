export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { Plus, Send } from 'lucide-react'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

const TYPE_COLORS: Record<string, string> = {
  'Acquisition':    'bg-blue-500/10 text-blue-400',
  'Depreciation':   'bg-amber-500/10 text-amber-400',
  'Write-Down':     'bg-red-500/10 text-red-400',
  'Disposal':       'bg-zinc-700 text-zinc-400',
  'Appreciation':   'bg-emerald-500/10 text-emerald-400',
}

const SAMPLE_LINES = [
  { id: '1', date: '2026-04-01', faNo: 'FA-00001', faName: 'CNC Machine',      postingType: 'Acquisition',  book: 'BOOK-GAAP', amount: 85000.00, posted: true },
  { id: '2', date: '2026-04-01', faNo: 'FA-00001', faName: 'CNC Machine',      postingType: 'Acquisition',  book: 'BOOK-TAX',  amount: 85000.00, posted: true },
  { id: '3', date: '2026-03-31', faNo: 'FA-00003', faName: 'Fork Lift',         postingType: 'Depreciation', book: 'BOOK-GAAP', amount:  1250.00, posted: true },
  { id: '4', date: '2026-03-31', faNo: 'FA-00005', faName: 'Server Rack A',     postingType: 'Depreciation', book: 'BOOK-TAX',  amount:  2100.00, posted: true },
  { id: '5', date: '2026-04-15', faNo: 'FA-00002', faName: 'Office Building',   postingType: 'Appreciation', book: 'BOOK-IFRS', amount: 12000.00, posted: false },
]

export default function FAJournalPage() {
  const posted = SAMPLE_LINES.filter(l => l.posted)
  const unposted = SAMPLE_LINES.filter(l => !l.posted)

  return (
    <>
      <TopBar
        title="FA Journal"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Fixed Assets', href: '/finance/fixed-assets' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/finance/fixed-assets/fa-journal/new"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Line
            </Link>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[12px] font-medium rounded transition-colors">
              <Send className="w-3.5 h-3.5" /> Post Journal
            </button>
          </div>
        }
      />
      <div className="flex min-h-[100dvh] bg-[#0f0f1a]">
        <aside className="w-60 shrink-0 border-r border-zinc-800/50 bg-[#0f0f1a] p-4 space-y-5">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Posting Type</div>
            <div className="space-y-1">
              {['All', 'Acquisition', 'Depreciation', 'Disposal', 'Write-Down', 'Appreciation'].map(t => (
                <Link
                  key={t}
                  href={`/finance/fixed-assets/fa-journal?type=${t === 'All' ? '' : t}`}
                  className="block px-2 py-1.5 rounded text-[12px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Book</div>
            <div className="space-y-1">
              {['All', 'BOOK-GAAP', 'BOOK-TAX', 'BOOK-IFRS'].map(b => (
                <Link
                  key={b}
                  href={`/finance/fixed-assets/fa-journal?book=${b === 'All' ? '' : b}`}
                  className="block px-2 py-1.5 rounded text-[12px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                >
                  {b}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Lines</div>
              <div className="text-2xl font-bold text-zinc-100">{SAMPLE_LINES.length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Posted</div>
              <div className="text-2xl font-bold text-emerald-400">{posted.length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Unposted</div>
              <div className="text-2xl font-bold text-amber-400">{unposted.length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Amount</div>
              <div className="text-xl font-bold text-zinc-100 tabular-nums">{formatCurrency(SAMPLE_LINES.reduce((s, l) => s + l.amount, 0))}</div>
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Date</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">FA No.</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">FA Name</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Posting Type</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Book</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Amount</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Posted</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_LINES.map((line, idx) => (
                  <tr key={line.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== SAMPLE_LINES.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                    <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{line.date}</td>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-blue-400">
                      <Link href={`/finance/fixed-assets/${line.id}`} className="hover:underline">{line.faNo}</Link>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-200 text-[12px]">{line.faName}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${TYPE_COLORS[line.postingType] ?? 'bg-zinc-700 text-zinc-400'}`}>
                        {line.postingType}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-400">{line.book}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-zinc-200">{formatCurrency(line.amount)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`w-2 h-2 rounded-full inline-block ${line.posted ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-[12px] text-zinc-500">{SAMPLE_LINES.length} journal lines</div>
        </main>
      </div>
    </>
  )
}
