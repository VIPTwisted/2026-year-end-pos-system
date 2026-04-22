import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Building, Building2, Users, Warehouse, Network, Plus, Edit2, Trash2,
  ChevronRight, MapPin
} from 'lucide-react'

export const dynamic = 'force-dynamic'

type OrgUnitWithChildren = {
  id: string
  name: string
  unitType: string
  code: string
  parentId: string | null
  managerId: string | null
  description: string | null
  isActive: boolean
  sortOrder: number
  children: OrgUnitWithChildren[]
}

const UNIT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  company: Building2,
  division: Building,
  department: Users,
  team: Users,
  store: MapPin,
  warehouse: Warehouse,
}

const UNIT_COLORS: Record<string, string> = {
  company: 'text-blue-400',
  division: 'text-violet-400',
  department: 'text-emerald-400',
  team: 'text-amber-400',
  store: 'text-pink-400',
  warehouse: 'text-cyan-400',
}

function buildTree(units: OrgUnitWithChildren[]): OrgUnitWithChildren[] {
  const map = new Map<string, OrgUnitWithChildren>()
  units.forEach(u => map.set(u.id, { ...u, children: [] }))
  const roots: OrgUnitWithChildren[] = []
  units.forEach(u => {
    const node = map.get(u.id)!
    if (u.parentId && map.has(u.parentId)) {
      map.get(u.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

function TreeNode({ unit, depth = 0 }: { unit: OrgUnitWithChildren; depth?: number }) {
  const Icon = UNIT_ICONS[unit.unitType] ?? Network
  const color = UNIT_COLORS[unit.unitType] ?? 'text-zinc-400'

  return (
    <div>
      <div
        className={`flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/30 transition-colors group border-b border-zinc-800/30 last:border-0`}
        style={{ paddingLeft: `${16 + depth * 24}px` }}
      >
        {depth > 0 && <ChevronRight className="w-3 h-3 text-zinc-700 shrink-0" />}
        <Icon className={`w-4 h-4 shrink-0 ${color}`} />
        <div className="flex-1 min-w-0">
          <span className="text-sm text-zinc-200 font-medium">{unit.name}</span>
          <span className="ml-2 text-xs text-zinc-600 font-mono">{unit.code}</span>
          {unit.managerId && (
            <span className="ml-2 text-xs text-zinc-600">· mgr: {unit.managerId}</span>
          )}
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
          unit.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-500'
        }`}>
          {unit.unitType}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/admin/org-hierarchy/${unit.id}`}>
            <button className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>
      {unit.children.map(child => (
        <TreeNode key={child.id} unit={child} depth={depth + 1} />
      ))}
    </div>
  )
}

export default async function OrgHierarchyPage() {
  const units = await prisma.orgUnit.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  const tree = buildTree(units as OrgUnitWithChildren[])
  const totalUnits = units.length
  const departments = units.filter(u => u.unitType === 'department').length
  const activeStores = units.filter(u => u.unitType === 'store' && u.isActive).length

  return (
    <>
      <TopBar
        title="Org Hierarchy"
        breadcrumb={[{ label: 'Admin', href: '/admin/users' }]}
        actions={
          <Link href="/admin/org-hierarchy/new">
            <Button size="sm" className="h-8 text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add Unit
            </Button>
          </Link>
        }
      />
      <main className="flex-1 p-6 bg-[#0f0f1a] min-h-screen space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Units', value: totalUnits, color: 'text-blue-400' },
            { label: 'Departments', value: departments, color: 'text-emerald-400' },
            { label: 'Active Stores', value: activeStores, color: 'text-pink-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-xs text-zinc-500 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tree */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
            <Network className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Organization Structure</h3>
          </div>
          {tree.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-xs text-zinc-600 mb-3">No org units defined yet.</p>
              <Link href="/admin/org-hierarchy/new">
                <Button size="sm" variant="outline" className="text-xs gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add First Unit
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              {tree.map(unit => (
                <TreeNode key={unit.id} unit={unit} depth={0} />
              ))}
            </div>
          )}
        </div>

      </main>
    </>
  )
}
