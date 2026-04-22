export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewAssetPage() {
  return (
    <>
      <TopBar
        title="New Asset"
        breadcrumb={[{ label: 'Assets', href: '/assets' }]}
      />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        <form action="/api/assets" method="POST" className="max-w-4xl space-y-6">
          <div className="flex items-center justify-between mb-2">
            <Link href="/assets" className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 text-[13px] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Assets
            </Link>
            <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded transition-colors">
              <Save className="w-3.5 h-3.5" /> Save Asset
            </button>
          </div>

          {/* FastTab: General */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
              <h2 className="text-[13px] font-semibold text-zinc-200">General</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Asset ID</label>
                <input name="assetId" placeholder="Auto-generated" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Asset Name *</label>
                <input name="name" required placeholder="e.g. CNC Mill Machine" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Asset Type *</label>
                <select name="assetType" required className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500">
                  <option value="">— Select —</option>
                  <option value="Machinery">Machinery</option>
                  <option value="Material Handling">Material Handling</option>
                  <option value="IT Equipment">IT Equipment</option>
                  <option value="Utility">Utility</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Tooling">Tooling</option>
                  <option value="Building">Building</option>
                  <option value="Infrastructure">Infrastructure</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Manufacturer</label>
                <input name="manufacturer" placeholder="e.g. Haas, Toyota, Dell" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Model / Part No.</label>
                <input name="model" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Serial Number</label>
                <input name="serialNumber" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Functional Location</label>
                <input name="functionalLocation" placeholder="e.g. Building A - Bay 2" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Status</label>
                <select name="status" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500">
                  <option value="Active">Active</option>
                  <option value="In Use">In Use</option>
                  <option value="Under Repair">Under Repair</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Acquisition Date</label>
                <input type="date" name="acquisitionDate" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>

          {/* FastTab: Technical Specifications */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
              <h2 className="text-[13px] font-semibold text-zinc-200">Technical Specifications</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Power Rating</label>
                <input name="powerRating" placeholder="e.g. 50HP, 480V" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Weight (kg)</label>
                <input name="weight" type="number" step="0.01" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Dimensions (LxWxH mm)</label>
                <input name="dimensions" placeholder="e.g. 2000x1500x1200" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Technical Notes</label>
                <textarea name="techNotes" rows={2} className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500 resize-none" />
              </div>
            </div>
          </div>

          {/* FastTab: Warranty */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
              <h2 className="text-[13px] font-semibold text-zinc-200">Warranty</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Warranty Start</label>
                <input type="date" name="warrantyStart" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Warranty End</label>
                <input type="date" name="warrantyEnd" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Vendor / Supplier</label>
                <input name="warrantyVendor" placeholder="Warranty provider" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>

        </form>
      </div>
    </>
  )
}
