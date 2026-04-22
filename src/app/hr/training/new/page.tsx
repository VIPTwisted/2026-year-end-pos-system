export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewTrainingCoursePage() {
  return (
    <>
      <TopBar
        title="New Training Course"
        breadcrumb={[
          { label: 'Human Resources', href: '/hr' },
          { label: 'Training', href: '/hr/training' },
        ]}
      />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        <form action="/api/hr/workforce/training" method="POST" className="max-w-3xl space-y-6">
          <div className="flex items-center justify-between mb-2">
            <Link href="/hr/training" className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 text-[13px] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Training
            </Link>
            <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded transition-colors">
              <Save className="w-3.5 h-3.5" /> Save Course
            </button>
          </div>

          {/* FastTab: General */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
              <h2 className="text-[13px] font-semibold text-zinc-200">General</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Course Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. POS System Onboarding"
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Category *</label>
                <select
                  name="category"
                  required
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="compliance">Compliance</option>
                  <option value="product">Product</option>
                  <option value="safety">Safety</option>
                  <option value="leadership">Leadership</option>
                  <option value="pos-system">POS System</option>
                  <option value="customer-service">Customer Service</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Format *</label>
                <select
                  name="format"
                  required
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="online">Online</option>
                  <option value="in-person">In-Person</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Duration (minutes)</label>
                <input
                  name="duration"
                  type="number"
                  min="1"
                  defaultValue="60"
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Expires in (days, optional)</label>
                <input
                  name="expiresInDays"
                  type="number"
                  min="1"
                  placeholder="Leave blank = no expiry"
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Course objectives and overview"
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isRequired" className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 accent-blue-500" />
                  <span className="text-[13px] text-zinc-300">Required Training</span>
                </label>
              </div>
            </div>
          </div>

          {/* FastTab: Schedule */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
              <h2 className="text-[13px] font-semibold text-zinc-200">Schedule</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Instructor</label>
                <input
                  name="instructor"
                  placeholder="Instructor name"
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  name="scheduledDate"
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Location</label>
                <input
                  name="location"
                  placeholder="Room / URL"
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
