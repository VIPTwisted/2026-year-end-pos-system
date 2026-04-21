import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { TRAINING_MODULES } from '@/lib/training-data'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Layers,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  CheckSquare,
  ChevronRight,
  Clock,
  List,
  Brain,
  Lightbulb,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react'
import { ModuleFAQ } from './ModuleFAQ'

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

export async function generateStaticParams() {
  return TRAINING_MODULES.map(m => ({ moduleId: m.id }))
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>
}) {
  const { moduleId } = await params
  const module = TRAINING_MODULES.find(m => m.id === moduleId)
  if (!module) notFound()

  const Icon = ICON_MAP[module.icon] ?? BookOpen
  const moduleIndex = TRAINING_MODULES.findIndex(m => m.id === moduleId)
  const totalModules = TRAINING_MODULES.length

  // Visual-only progress (position in module list)
  const progressPct = Math.round(((moduleIndex + 1) / totalModules) * 100)

  return (
    <>
      <TopBar title={module.title} />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Link href="/training" className="hover:text-zinc-300 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              Training
            </Link>
            <ChevronRight className="w-3 h-3 text-zinc-700" />
            <span className="text-zinc-300">{module.title}</span>
          </nav>

          {/* Module Header */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-zinc-800 text-zinc-300 shrink-0">
                <Icon className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[module.category]}`}
                  >
                    {module.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock className="w-3 h-3" />
                    <span>{module.estimatedMinutes} min</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <List className="w-3 h-3" />
                    <span>{module.steps.length} steps</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Brain className="w-3 h-3" />
                    <span>{module.concepts.length} concepts</span>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-zinc-100 leading-tight">{module.title}</h1>
              </div>
            </div>

            {/* Progress bar (visual only) */}
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                <span>Module {moduleIndex + 1} of {totalModules}</span>
                <span>{progressPct}% through the curriculum</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Overview */}
            <p className="text-sm text-zinc-400 leading-relaxed">{module.overview}</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main content column */}
            <div className="xl:col-span-2 space-y-8">

              {/* Key Concepts */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <h2 className="text-base font-semibold text-zinc-200">Key Concepts</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {module.concepts.map((concept, i) => (
                    <Card key={i} className="hover:border-zinc-700 transition-colors">
                      <CardContent className="pt-4 pb-4">
                        <p className="text-xs font-semibold text-blue-300 mb-1.5 uppercase tracking-wide">
                          {concept.term}
                        </p>
                        <p className="text-sm text-zinc-400 leading-relaxed">{concept.definition}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Step-by-Step */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <List className="w-4 h-4 text-violet-400" />
                  <h2 className="text-base font-semibold text-zinc-200">Step-by-Step Procedure</h2>
                </div>
                <div className="space-y-0">
                  {module.steps.map((step, i) => (
                    <div key={i} className="flex gap-5 pb-6 relative">
                      {/* Connector line */}
                      {i < module.steps.length - 1 && (
                        <div className="absolute left-[19px] top-10 w-px bg-zinc-800 h-full" />
                      )}
                      {/* Step number */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 border-2 border-violet-600/50 flex items-center justify-center">
                          <span className="text-sm font-bold text-violet-300">{step.step}</span>
                        </div>
                      </div>
                      {/* Content */}
                      <div className="flex-1 pt-1.5">
                        <p className="text-sm font-semibold text-zinc-200 mb-1.5">{step.title}</p>
                        <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQs */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-4 h-4 text-amber-400" />
                  <h2 className="text-base font-semibold text-zinc-200">Frequently Asked Questions</h2>
                </div>
                <ModuleFAQ faqs={module.faqs} />
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Tips */}
              <Card>
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">Pro Tips</h3>
                </div>
                <CardContent className="pt-4 pb-4">
                  <ul className="space-y-3">
                    {module.tips.map((tip, i) => (
                      <li key={i} className="flex gap-3 text-sm text-zinc-400 leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Module summary */}
              <Card>
                <div className="px-5 py-4 border-b border-zinc-800">
                  <h3 className="text-sm font-semibold text-zinc-200">Module Summary</h3>
                </div>
                <CardContent className="pt-4 pb-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Category</span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[module.category]}`}
                      >
                        {module.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Duration</span>
                      <span className="text-zinc-300 font-medium">{module.estimatedMinutes} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Concepts</span>
                      <span className="text-zinc-300 font-medium">{module.concepts.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Procedures</span>
                      <span className="text-zinc-300 font-medium">{module.steps.length} steps</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">FAQs</span>
                      <span className="text-zinc-300 font-medium">{module.faqs.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Other modules */}
              <Card>
                <div className="px-5 py-4 border-b border-zinc-800">
                  <h3 className="text-sm font-semibold text-zinc-200">Other Modules</h3>
                </div>
                <CardContent className="pt-2 pb-2 px-0">
                  <ul className="divide-y divide-zinc-800/50">
                    {TRAINING_MODULES.filter(m => m.id !== module.id).map(m => {
                      const MIcon = ICON_MAP[m.icon] ?? BookOpen
                      return (
                        <li key={m.id}>
                          <Link
                            href={`/training/${m.id}`}
                            className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-800/40 transition-colors group"
                          >
                            <MIcon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
                            <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">
                              {m.title}
                            </span>
                            <ChevronRight className="w-3 h-3 text-zinc-700 group-hover:text-zinc-400 ml-auto" />
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </CardContent>
              </Card>

              {/* Back link */}
              <Link
                href="/training"
                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Training Center
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
