'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { FAQ } from '@/lib/training-data'

export function ModuleFAQ({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-zinc-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-start justify-between px-4 py-4 text-left bg-zinc-900 hover:bg-zinc-800/60 transition-colors gap-4"
          >
            <span className="text-sm font-medium text-zinc-200 leading-snug">{faq.question}</span>
            {openIndex === i ? (
              <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            )}
          </button>
          {openIndex === i && (
            <div className="px-4 py-4 bg-zinc-950 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
