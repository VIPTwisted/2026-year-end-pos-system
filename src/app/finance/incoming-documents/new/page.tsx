export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Upload, Save } from 'lucide-react'

export default function NewIncomingDocumentPage() {
  return (
    <>
      <TopBar title="New Incoming Document" />
      <main className="flex-1 p-6 overflow-auto max-w-3xl space-y-5">

        <div className="flex items-center gap-2 text-sm">
          <Link href="/finance/incoming-documents" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Incoming Documents
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-300">New</span>
        </div>

        {/* File Upload */}
        <Card>
          <div className="px-5 py-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-200">Attach Document</span>
          </div>
          <CardContent className="p-5">
            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-10 flex flex-col items-center justify-center gap-3 hover:border-zinc-500 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-zinc-600" />
              <p className="text-sm text-zinc-400">Drop PDF, image, or file here</p>
              <p className="text-xs text-zinc-600">or click to browse</p>
              <Button variant="outline" size="sm">Browse Files</Button>
            </div>
          </CardContent>
        </Card>

        {/* Document Details */}
        <Card>
          <div className="px-5 py-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-200">Document Details</span>
          </div>
          <CardContent className="p-5 grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-xs text-zinc-500 mb-1.5">Description</label>
              <input type="text" placeholder="Brief description of the document" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Vendor</label>
              <input type="text" placeholder="Search vendor..." className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Vendor Invoice No.</label>
              <input type="text" placeholder="Vendor's invoice number" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Expected Amount</label>
              <input type="number" step="0.01" placeholder="0.00" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Document Date</label>
              <input type="date" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-zinc-500 mb-1.5">Notes</label>
              <textarea rows={3} placeholder="Additional notes..." className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-500">
            <Save className="w-4 h-4" />
            Save Document
          </Button>
          <Button variant="outline" asChild>
            <Link href="/finance/incoming-documents">Cancel</Link>
          </Button>
        </div>
      </main>
    </>
  )
}
