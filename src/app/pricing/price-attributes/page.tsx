import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { SlidersHorizontal, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${
      active
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        : 'bg-zinc-700/40 text-zinc-500 border-zinc-600/40'
    }`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

const TYPE_LABELS: Record<string, string> = {
  product: 'Product', customer: 'Customer', order: 'Order', channel: 'Channel',
}
const DATA_TYPE_LABELS: Record<string, string> = {
  text: 'Text', number: 'Number', boolean: 'Boolean', date: 'Date', list: 'List',
}
const COMPONENT_TYPE_LABELS: Record<string, string> = {
  base: 'Base', discount: 'Discount', surcharge: 'Surcharge', tax: 'Tax', freight: 'Freight',
}

export default async function PriceAttributesPage() {
  const [attributes, componentCodes] = await Promise.all([
    prisma.priceAttribute.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
    prisma.priceComponentCode.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Price Attribute Setup" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
          <h1 className="text-sm font-semibold text-zinc-200">Price Attribute Setup</h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Price Attributes Panel */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-zinc-800/30 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-200">Price Attributes</h2>
                <p className="text-[11px] text-zinc-600 mt-0.5">Define dimensions used in pricing logic</p>
              </div>
              <Link href="/pricing/price-attributes/new?tab=attribute">
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                  <Plus className="w-3.5 h-3.5" /> New Attribute
                </button>
              </Link>
            </div>
            {attributes.length === 0 ? (
              <p className="px-5 py-5 text-[13px] text-zinc-600">No price attributes defined.</p>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                    {['Code', 'Name', 'Type', 'Data Type', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attributes.map(attr => (
                    <tr key={attr.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2 font-mono text-[12px] text-blue-400">{attr.code}</td>
                      <td className="px-4 py-2 text-zinc-300">{attr.name}</td>
                      <td className="px-4 py-2 text-zinc-500">{TYPE_LABELS[attr.attributeType] ?? attr.attributeType}</td>
                      <td className="px-4 py-2 text-zinc-500">{DATA_TYPE_LABELS[attr.dataType] ?? attr.dataType}</td>
                      <td className="px-4 py-2"><ActiveBadge active={attr.isActive} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Price Component Codes Panel */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-zinc-800/30 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-200">Price Component Codes</h2>
                <p className="text-[11px] text-zinc-600 mt-0.5">Base, discount, surcharge, tax, freight codes</p>
              </div>
              <Link href="/pricing/price-attributes/new?tab=component">
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                  <Plus className="w-3.5 h-3.5" /> New Component Code
                </button>
              </Link>
            </div>
            {componentCodes.length === 0 ? (
              <p className="px-5 py-5 text-[13px] text-zinc-600">No component codes defined.</p>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                    {['Code', 'Name', 'Type', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {componentCodes.map(cc => (
                    <tr key={cc.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2 font-mono text-[12px] text-blue-400">{cc.code}</td>
                      <td className="px-4 py-2 text-zinc-300">{cc.name}</td>
                      <td className="px-4 py-2 text-zinc-500">{COMPONENT_TYPE_LABELS[cc.componentType] ?? cc.componentType}</td>
                      <td className="px-4 py-2"><ActiveBadge active={cc.isActive} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
