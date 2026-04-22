import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Receipt, MapPin, FileCheck, ChevronRight } from 'lucide-react'

export default async function TaxPage() {
  const [groups, nexus, exemptions] = await Promise.all([
    prisma.taxGroup.findMany(),
    prisma.taxNexus.findMany(),
    prisma.taxExemption.findMany(),
  ])

  const statesWithNexus = nexus.filter((n) => n.hasNexus)

  const ALL_STATES = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
  ]

  const nexusSet = new Set(statesWithNexus.map((n) => n.stateCode))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Tax Management</h1>
        <p className="text-zinc-400 text-sm mt-1">Configure tax groups, nexus, and exemptions</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-zinc-400 text-sm">Total Groups</span>
          </div>
          <p className="text-3xl font-bold text-zinc-100">{groups.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-zinc-400 text-sm">States with Nexus</span>
          </div>
          <p className="text-3xl font-bold text-zinc-100">{statesWithNexus.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-zinc-400 text-sm">Exemptions</span>
          </div>
          <p className="text-3xl font-bold text-zinc-100">{exemptions.length}</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h2 className="text-sm font-medium text-zinc-400 mb-4">US State Nexus Coverage</h2>
        <div className="grid grid-cols-10 gap-2">
          {ALL_STATES.map((s) => (
            <div key={s.code} title={s.name} className="flex flex-col items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${nexusSet.has(s.code) ? 'bg-emerald-400' : 'bg-zinc-700'}`} />
              <span className="text-xs text-zinc-500">{s.code}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Has Nexus</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-700 inline-block" /> No Nexus</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { href: '/tax/groups', label: 'Tax Groups', desc: 'Manage tax group codes and components' },
          { href: '/tax/nexus', label: 'State Nexus', desc: 'Configure nexus by state' },
          { href: '/tax/exemptions', label: 'Exemptions', desc: 'Manage customer tax exemptions' },
        ].map((link) => (
          <Link key={link.href} href={link.href}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between hover:border-zinc-700 transition-colors">
            <div>
              <p className="text-sm font-medium text-zinc-100">{link.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{link.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </Link>
        ))}
      </div>
    </div>
  )
}
