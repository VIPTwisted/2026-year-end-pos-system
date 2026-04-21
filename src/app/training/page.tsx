import { TopBar } from '@/components/layout/TopBar'
import { TRAINING_MODULES } from '@/lib/training-data'
import { TrainingHub } from './TrainingHub'
import { BookOpen, LayoutGrid, Clock } from 'lucide-react'

const TOTAL_MINUTES = TRAINING_MODULES.reduce((sum, m) => sum + m.estimatedMinutes, 0)
const CATEGORIES = [...new Set(TRAINING_MODULES.map(m => m.category))]

export default function TrainingPage() {
  return (
    <>
      <TopBar title="BC Training" />
      <main className="flex-1 p-6 overflow-auto">
        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-blue-600/15 border border-blue-600/25">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100 leading-tight">
                Business Central Training Center
              </h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                Master the D365 Business Central finance workflows
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-6 mt-5 pt-5 border-t border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-zinc-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-zinc-100 leading-none">{TRAINING_MODULES.length}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Modules</p>
              </div>
            </div>

            <div className="w-px h-10 bg-zinc-800" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                <LayoutGrid className="w-4 h-4 text-zinc-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-zinc-100 leading-none">{CATEGORIES.length}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Categories</p>
              </div>
            </div>

            <div className="w-px h-10 bg-zinc-800" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Clock className="w-4 h-4 text-zinc-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-zinc-100 leading-none">~{TOTAL_MINUTES}</p>
                <p className="text-xs text-zinc-500 mt-0.5">mins total content</p>
              </div>
            </div>

            <div className="ml-auto text-right hidden sm:block">
              <p className="text-xs text-zinc-600 uppercase tracking-wide font-medium">Source</p>
              <p className="text-xs text-zinc-500 mt-0.5">Microsoft Dynamics 365 Finance Docs</p>
            </div>
          </div>
        </div>

        {/* Hub — client component with filters + cards */}
        <div className="space-y-5">
          <TrainingHub modules={TRAINING_MODULES} />
        </div>
      </main>
    </>
  )
}
