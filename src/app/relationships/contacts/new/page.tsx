export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewContactPage() {
  return (
    <>
      <TopBar title="New Contact" />
      <main className="flex-1 p-6 overflow-auto max-w-4xl space-y-5">

        <div className="flex items-center gap-2 text-sm">
          <Link href="/relationships/contacts" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Contacts
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-300">New Contact</span>
        </div>

        {/* FastTab: General */}
        <Card>
          <div className="px-5 py-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-200">General</span>
          </div>
          <CardContent className="p-5 grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Contact Type</label>
              <select className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300">
                <option>Person</option>
                <option>Company</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Company Name</label>
              <input type="text" placeholder="Company name" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">First Name</label>
              <input type="text" placeholder="First name" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Last Name</label>
              <input type="text" placeholder="Last name" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Salesperson Code</label>
              <select className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300">
                <option value="">— Assign —</option>
                <option>JD</option>
                <option>BK</option>
                <option>TR</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Job Title</label>
              <input type="text" placeholder="e.g. Procurement Manager" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
          </CardContent>
        </Card>

        {/* FastTab: Communication */}
        <Card>
          <div className="px-5 py-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-200">Communication</span>
          </div>
          <CardContent className="p-5 grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Phone No.</label>
              <input type="tel" placeholder="555-0000" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Mobile Phone</label>
              <input type="tel" placeholder="555-0001" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-zinc-500 mb-1.5">Email Address</label>
              <input type="email" placeholder="contact@company.com" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Address</label>
              <input type="text" placeholder="Street address" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">City</label>
              <input type="text" placeholder="City" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">State / Province</label>
              <input type="text" placeholder="State" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Post Code</label>
              <input type="text" placeholder="ZIP / Post Code" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
          </CardContent>
        </Card>

        {/* FastTab: Segmentation */}
        <Card>
          <div className="px-5 py-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-200">Segmentation</span>
          </div>
          <CardContent className="p-5 grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Territory Code</label>
              <input type="text" placeholder="e.g. NORTHEAST" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Industry Group</label>
              <select className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300">
                <option value="">— Select —</option>
                <option>Manufacturing</option>
                <option>Retail</option>
                <option>Technology</option>
                <option>Healthcare</option>
                <option>Finance</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-zinc-500 mb-1.5">Notes</label>
              <textarea rows={3} placeholder="Notes about this contact..." className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 pt-2">
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-500">
            <Save className="w-4 h-4" />
            Save Contact
          </Button>
          <Button variant="outline" asChild>
            <Link href="/relationships/contacts">Cancel</Link>
          </Button>
        </div>
      </main>
    </>
  )
}
