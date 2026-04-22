export const dynamic = 'force-dynamic'
import Link from 'next/link'

export default function ContactCenterScriptsPage() {
  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-3 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/contact-center" className="hover:text-white transition-colors">Contact Center</Link>
        <span>/</span>
        <span className="text-white font-medium">Agent Scripts</span>
      </div>
      <div className="p-8">
        <h1 className="text-xl font-semibold text-white mb-2">Agent Scripts</h1>
        <p className="text-slate-400 text-sm">Manage guided agent scripts for contact center interactions. Coming soon.</p>
      </div>
    </div>
  )
}
