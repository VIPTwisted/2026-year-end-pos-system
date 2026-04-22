'use client'
import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-400 hover:text-zinc-200 text-[13px] font-medium transition-colors print:hidden"
    >
      <Printer className="w-3.5 h-3.5" />
      Print
    </button>
  )
}
