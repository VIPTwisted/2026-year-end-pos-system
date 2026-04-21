'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Layers,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  CheckSquare,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  Lightbulb,
  List,
  Brain,
  MessageCircle,
} from 'lucide-react'
import type { TrainingModule } from '@/lib/training-data'

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Layers,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  CheckSquare,
}

const CATEGORY_COLORS: Record<string, string> = {
  'Core Finance': 'bg-blue-600/20 text-blue-300 border-blue-600/30',
  Operations: 'bg-violet-600/20 text-violet-300 border-violet-600/30',
  'Period Close': 'bg-amber-600/20 text-amber-300 border-amber-600/30',
}

const FILTER_TABS = ['All', 'Core Finance', 'Operations', 'Period Close'] as const
type FilterTab = (typeof FILTER_TABS)[number]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-zinc-900 hover:bg-zinc-800/60 transition-colors"
      >
        <span className="text-sm font-medium text-zinc-200 pr-4">{question}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 py-3 bg-zinc-950 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800">
          {answer}
        </div>
      )}
    </div>
  )
}

function SlideOver({
  module,
  isComplete,
  onMarkComplete,
  onClose,
}: {
  module: TrainingModule
  isComplete: boolean
  onMarkComplete: () => void
  onClose: () => void
}) {
  const Icon = ICON_MAP[module.icon] ?? BookOpen

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-zinc-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 flex flex-col h-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-start gap-4 px-6 py-5 border-b border-zinc-800 shrink-0">
          <div className="p-2.5 rounded-lg bg-zinc-800 text-zinc-300">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-base font-semibold text-zinc-100">{module.title}</h2>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[module.category]}`}
              >
                {module.category}
              </span>
              {isComplete && (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-600/30">
                  <Check className="w-3 h-3" /> Complete
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <Clock className="w-3 h-3" />
              <span>{module.estimatedMinutes} min</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">
          {/* Overview */}
          <div>
            <p className="text-sm text-zinc-400 leading-relaxed">{module.overview}</p>
          </div>

          {/* Key Concepts */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">Key Concepts</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {module.concepts.map((concept, i) => (
                <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-xs font-semibold text-blue-300 mb-1">{concept.term}</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">{concept.definition}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <List className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">Step-by-Step</h3>
            </div>
            <div className="space-y-3">
              {module.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600/20 border border-violet-600/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-violet-300">{step.step}</span>
                  </div>
                  <div className="flex-1 pb-3 border-b border-zinc-800/50 last:border-0">
                    <p className="text-sm font-semibold text-zinc-200 mb-1">{step.title}</p>
                    <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">FAQs</h3>
            </div>
            <div className="space-y-2">
              {module.faqs.map((faq, i) => (
                <FAQItem key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>

          {/* Tips */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">Pro Tips</h3>
            </div>
            <ul className="space-y-2">
              {module.tips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-400 leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 shrink-0">
          {isComplete ? (
            <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
              <Check className="w-4 h-4" />
              Module complete — great work!
            </div>
          ) : (
            <Button
              onClick={onMarkComplete}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function TrainingHub({ modules }: { modules: TrainingModule[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All')
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const filtered =
    activeFilter === 'All' ? modules : modules.filter(m => m.category === activeFilter)

  function markComplete(id: string) {
    setCompletedIds(prev => new Set([...prev, id]))
  }

  return (
    <>
      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              activeFilter === tab
                ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
            }`}
          >
            {tab}
            {tab !== 'All' && (
              <span className="ml-1.5 text-xs opacity-60">
                ({modules.filter(m => m.category === tab).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(module => {
          const Icon = ICON_MAP[module.icon] ?? BookOpen
          const isComplete = completedIds.has(module.id)

          return (
            <Card
              key={module.id}
              className={`relative flex flex-col transition-all hover:border-zinc-700 ${
                isComplete ? 'border-emerald-700/50' : ''
              }`}
            >
              {isComplete && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col gap-3">
                {/* Icon + category */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[module.category]}`}
                    >
                      {module.category}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">{module.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3">
                    {module.overview.slice(0, 130)}
                    {module.overview.length > 130 ? '…' : ''}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-zinc-500 mt-auto pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {module.estimatedMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <List className="w-3 h-3" />
                    {module.steps.length} steps
                  </span>
                  <span className="flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    {module.concepts.length} concepts
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 pb-5">
                <Button
                  onClick={() => setSelectedModule(module)}
                  variant="outline"
                  className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold"
                >
                  {isComplete ? 'Review Module' : 'Start Module'}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* SlideOver */}
      {selectedModule && (
        <SlideOver
          module={selectedModule}
          isComplete={completedIds.has(selectedModule.id)}
          onMarkComplete={() => markComplete(selectedModule.id)}
          onClose={() => setSelectedModule(null)}
        />
      )}
    </>
  )
}
