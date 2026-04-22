import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { FileText, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  draft:     'bg-zinc-700/40 text-zinc-400',
  sent:      'bg-blue-500/20 text-blue-400',
  confirmed: 'bg-emerald-500/20 text-emerald-400',
  invoiced:  'bg-purple-500/20 text-purple-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default async function ProformaListPage() {
  const invoices = await prisma.proformaInvoice.findMany({
    include: {
      project:  { select: { projectNo: true, description: true } },
      customer: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const kpi = {
    draft:     invoices.filter(i => i.status === 'draft').length,
    sent:      invoices.filter(i => i.status === 'sent').length,
    confirmed: invoices.filter(i => i.status === 'confirmed').length,
    total:     invoices.reduce((s, i) => s + i.total, 0),
  }

  return (
    <>
      <TopBar title="Proforma Invoices" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Projects / Invoicing</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Proforma Invoices</h2>
            </div>
            <Link
              href="/projects/invoicing/proforma/new"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Proforma
            </Link>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Draft',     value: kpi.draft,     color: 'text-zinc-300' },
              { label: 'Sent',      value: kpi.sent,      color: 'text-blue-400' },
              { label: 'Confirmed', value: kpi.confirmed, color: 'text-emerald-400' },
              { label: 'Total Value', value: `$${kpi.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-purple-400' },
            ].map(k => (
              <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
                <p className="text-xs text-zinc-500 mb-1">{k.label}</p>
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Invoice #</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Project</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-600">No proforma invoices yet</td>
                  </tr>
                )}
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3 text-zinc-200 font-mono text-xs">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-zinc-300">{inv.project.projectNo} — {inv.project.description}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {inv.customer ? `${inv.customer.firstName} ${inv.customer.lastName}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-zinc-200 text-right font-mono">
                      ${inv.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[inv.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/projects/invoicing/proforma/${inv.id}`} className="text-blue-400 hover:text-blue-300 text-xs">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
