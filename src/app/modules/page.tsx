'use client'
import { useState } from 'react'
import {
  Star, ChevronDown, ChevronRight, Clock, Briefcase, LayoutGrid,
  DollarSign, BarChart3, TrendingUp, Users, MapPin, Heart,
  Calculator, Settings2, CalendarDays, UserCheck, Package,
  Building2, Shield, FileText, Factory, CheckCircle,
  Activity, Truck, Layers, Target, Receipt, ShoppingBag,
  Cpu, Globe, ClipboardList, PieChart,
  BarChart2, Wrench, Network, FlaskConical, HandCoins,
  Banknote, Monitor, Store, BookOpen, Landmark,
  GitBranch, Wallet, Database, Printer, ScanLine,
  Boxes, ShoppingCart, CircleDollarSign, LineChart,
  GraduationCap, Zap, HardDrive, Server, Gauge,
  Headphones, Hammer, Leaf, Award, Link2,
} from 'lucide-react'

/* ─────────────────────────── types ─────────────────────────── */
interface ModuleTile {
  name: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  accent: 'teal' | 'navy'
}

/* ─────────────── sidebar sections ─────────────────────────── */
const FAVORITES: string[] = [
  'Budget control configuration',
  'Budget cycles',
  'Open positions',
]

const RECENT: string[] = [
  'Item groups',
  'Main accounts',
  'Posting',
  'Tracking dimension groups',
  'Colors',
  'Storage dimension groups',
  'Product dimension groups',
  'Item model groups',
  'Tracking dimension groups',
  'Storage dimension groups',
]

const WORKSPACES: string[] = [
  'Asset management',
  'Benefits management',
  'Budget planning',
  'Cash overview',
  'Cost accounting',
  'Employee self service',
  'Financial insights',
  'Fixed asset management',
  'Procurement',
  'Project management',
  'Vendor collaboration',
]

const MODULES: string[] = [
  'Accounts payable',
  'Accounts receivable',
  'Audit workbench',
  'Budgeting',
  'Cash and bank management',
  'Common',
  'Consolidations',
  'Cost accounting',
  'Cost management',
  'Credit and collections',
  'Demo data',
  'Expense management',
  'Fixed assets',
  'Fleet management',
  'General ledger',
  'Human resources',
  'Inventory management',
  'Master planning',
  'Organization administration',
  'Payroll',
  'Procurement and sourcing',
  'Product information management',
  'Production control',
  'Project management and accounting',
  'Retail and commerce',
  'Sales and marketing',
  'Service management',
  'Supply chain management',
  'System administration',
  'Tax',
  'Transportation management',
  'Warehouse management',
]

/* ─────────────── module tiles (full list from screenshot) ──── */
const TILES: ModuleTile[] = [
  // Row 1
  { name: 'Bank management',                                          icon: Banknote,           accent: 'teal' },
  { name: 'Cost accounting ledger administration',                    icon: Calculator,         accent: 'navy' },
  { name: 'Financial insights',                                       icon: TrendingUp,         accent: 'teal' },
  { name: 'Personnel management',                                     icon: Users,              accent: 'navy' },
  { name: 'Reservation management',                                   icon: MapPin,             accent: 'teal' },
  // Row 2
  { name: 'Benefits',                                                 icon: Heart,              accent: 'navy' },
  { name: 'Cost administration',                                      icon: Settings2,          accent: 'teal' },
  { name: 'Financial period close',                                   icon: CalendarDays,       accent: 'navy' },
  { name: 'Pricing and discount management',                          icon: HandCoins,          accent: 'teal' },
  { name: 'Resource lifecycle management',                            icon: UserCheck,          accent: 'navy' },
  // Row 3
  { name: 'Budget planning',                                          icon: PieChart,           accent: 'teal' },
  { name: 'Cost analysis',                                            icon: BarChart3,          accent: 'navy' },
  { name: 'Fixed asset management',                                   icon: Building2,          accent: 'teal' },
  { name: 'Product readiness for discrete manufacturing',             icon: Package,            accent: 'navy' },
  { name: 'Retail IT',                                                icon: Monitor,            accent: 'teal' },
  // Row 4
  { name: 'Business processes for human resources',                   icon: Briefcase,          accent: 'navy' },
  { name: 'Cost control',                                             icon: Shield,             accent: 'teal' },
  { name: 'General journal processing',                               icon: FileText,           accent: 'navy' },
  { name: 'Product readiness for process manufacturing',              icon: FlaskConical,       accent: 'teal' },
  { name: 'Retail store financials',                                  icon: Store,              accent: 'navy' },
  // Row 5
  { name: 'Business processes for payroll',                           icon: Banknote,           accent: 'teal' },
  { name: 'Customer credit and collections',                          icon: CheckCircle,        accent: 'navy' },
  { name: 'Invoicing',                                                icon: Receipt,            accent: 'teal' },
  { name: 'Product variant model definition',                         icon: Layers,             accent: 'navy' },
  { name: 'Retail store management',                                  icon: ShoppingBag,        accent: 'teal' },
  // Row 6
  { name: 'Cash overview - all companies',                            icon: DollarSign,         accent: 'navy' },
  { name: 'Customer invoicing',                                       icon: Printer,            accent: 'teal' },
  { name: 'Ledger budgets and forecasts',                             icon: BarChart2,          accent: 'navy' },
  { name: 'Production floor management',                              icon: Factory,            accent: 'teal' },
  { name: 'Sales order processing and inquiry',                       icon: ClipboardList,      accent: 'navy' },
  // Row 7
  { name: 'Cash flow management',                                     icon: Activity,           accent: 'teal' },
  { name: 'Demand forecasting',                                       icon: LineChart,          accent: 'navy' },
  { name: 'Master planning',                                          icon: Network,            accent: 'teal' },
  { name: 'Project management and accounting',                        icon: Target,             accent: 'navy' },
  { name: 'Supply chain management',                                  icon: Truck,              accent: 'teal' },
  // Row 8
  { name: 'Compliance and internal controls',                         icon: Shield,             accent: 'navy' },
  { name: 'Electronic reporting',                                     icon: Globe,              accent: 'teal' },
  { name: 'Manufacturing execution',                                  icon: Cpu,                accent: 'navy' },
  { name: 'Quality management',                                       icon: CheckCircle,        accent: 'teal' },
  { name: 'Trade agreements',                                         icon: Wrench,             accent: 'navy' },
  // Row 9
  { name: 'Consolidation',                                            icon: GitBranch,          accent: 'teal' },
  { name: 'Employee development',                                     icon: GraduationCap,      accent: 'navy' },
  { name: 'Payroll processing',                                       icon: Wallet,             accent: 'teal' },
  { name: 'Rebate management',                                        icon: Award,              accent: 'navy' },
  { name: 'Tax accounting',                                           icon: Landmark,           accent: 'teal' },
  // Row 10
  { name: 'Accounts payable automation',                              icon: Zap,                accent: 'navy' },
  { name: 'Expense management',                                       icon: CircleDollarSign,   accent: 'teal' },
  { name: 'Procurement and sourcing',                                 icon: ShoppingCart,       accent: 'navy' },
  { name: 'Regulatory compliance',                                    icon: BookOpen,           accent: 'teal' },
  { name: 'Vendor invoicing',                                         icon: ScanLine,           accent: 'navy' },
  // Row 11
  { name: 'Asset management',                                         icon: HardDrive,          accent: 'teal' },
  { name: 'Fleet management',                                         icon: Truck,              accent: 'navy' },
  { name: 'Production scheduling',                                    icon: Gauge,              accent: 'teal' },
  { name: 'Retail category management',                               icon: Boxes,              accent: 'navy' },
  { name: 'Warehouse management',                                     icon: Database,           accent: 'teal' },
  // Row 12
  { name: 'Business intelligence',                                    icon: BarChart3,          accent: 'navy' },
  { name: 'HR self service',                                          icon: Headphones,         accent: 'teal' },
  { name: 'Process manufacturing',                                    icon: Hammer,             accent: 'navy' },
  { name: 'Sustainability reporting',                                  icon: Leaf,               accent: 'teal' },
  { name: 'Workflow automation',                                      icon: Link2,              accent: 'navy' },
]

/* ─────────────── collapsible section component ─────────────── */
function CollapseSection({
  label,
  icon: Icon,
  open,
  onToggle,
  children,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
      >
        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(165,180,252,0.55)' }} />
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(165,180,252,0.55)' }}>
          {label}
        </span>
        {open
          ? <ChevronDown className="w-3 h-3 shrink-0" style={{ color: 'rgba(165,180,252,0.4)' }} />
          : <ChevronRight className="w-3 h-3 shrink-0" style={{ color: 'rgba(165,180,252,0.4)' }} />
        }
      </button>
      {open && <div className="pb-1">{children}</div>}
    </div>
  )
}

/* ─────────────── main page ─────────────────────────────────── */
export default function ModulesPage() {
  const [favOpen, setFavOpen] = useState(true)
  const [recOpen, setRecOpen] = useState(true)
  const [wsOpen,  setWsOpen]  = useState(false)
  const [modOpen, setModOpen] = useState(false)

  return (
    <div className="flex min-h-[100dvh]" style={{ background: '#0d0e24' }}>

      {/* ── left sidebar ───────────────────────────────────────── */}
      <aside
        className="w-56 shrink-0 sticky top-0 h-screen overflow-y-auto flex flex-col"
        style={{ background: '#0a0b1e', borderRight: '1px solid rgba(99,102,241,0.15)' }}
      >
        {/* header */}
        <div className="px-3 py-3" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <p className="text-[11px] font-bold text-white/80 uppercase tracking-widest">Navigation</p>
        </div>

        {/* Favorites */}
        <CollapseSection label="Favorites" icon={Star} open={favOpen} onToggle={() => setFavOpen(v => !v)}>
          {FAVORITES.map(item => (
            <a
              key={item}
              href="#"
              className="flex items-center gap-2 px-4 py-1.5 no-underline hover:bg-white/5 group"
              onClick={e => e.preventDefault()}
            >
              <Star className="w-3 h-3 shrink-0" style={{ color: '#facc15' }} />
              <span className="text-[11px] leading-snug" style={{ color: 'rgba(203,213,225,0.75)' }}>{item}</span>
            </a>
          ))}
        </CollapseSection>

        {/* Recent */}
        <CollapseSection label="Recent" icon={Clock} open={recOpen} onToggle={() => setRecOpen(v => !v)}>
          {RECENT.map((item, i) => (
            <a
              key={`${item}-${i}`}
              href="#"
              className="flex items-center gap-2 px-4 py-1.5 no-underline hover:bg-white/5"
              onClick={e => e.preventDefault()}
            >
              <Clock className="w-3 h-3 shrink-0 opacity-40" style={{ color: '#a5b4fc' }} />
              <span className="text-[11px] leading-snug" style={{ color: 'rgba(203,213,225,0.65)' }}>{item}</span>
            </a>
          ))}
        </CollapseSection>

        {/* Workspaces */}
        <CollapseSection label="Workspaces" icon={LayoutGrid} open={wsOpen} onToggle={() => setWsOpen(v => !v)}>
          {WORKSPACES.map(item => (
            <a
              key={item}
              href="#"
              className="flex items-center gap-2 px-4 py-1.5 no-underline hover:bg-white/5"
              onClick={e => e.preventDefault()}
            >
              <LayoutGrid className="w-3 h-3 shrink-0 opacity-30" style={{ color: '#a5b4fc' }} />
              <span className="text-[11px] leading-snug" style={{ color: 'rgba(203,213,225,0.65)' }}>{item}</span>
            </a>
          ))}
        </CollapseSection>

        {/* Modules */}
        <CollapseSection label="Modules" icon={Briefcase} open={modOpen} onToggle={() => setModOpen(v => !v)}>
          {MODULES.map(item => (
            <a
              key={item}
              href="#"
              className="flex items-center gap-2 px-4 py-1.5 no-underline hover:bg-white/5"
              onClick={e => e.preventDefault()}
            >
              <ChevronRight className="w-3 h-3 shrink-0 opacity-30" style={{ color: '#a5b4fc' }} />
              <span className="text-[11px] leading-snug" style={{ color: 'rgba(203,213,225,0.65)' }}>{item}</span>
            </a>
          ))}
        </CollapseSection>
      </aside>

      {/* ── main content ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col">

        {/* hero banner — metallic architectural gradient */}
        <div
          className="relative overflow-hidden px-10 py-12"
          style={{
            background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
            borderBottom: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          {/* radial highlight simulating metallic sheen */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.07) 0%, transparent 55%),
                                radial-gradient(ellipse at 75% 15%, rgba(255,255,255,0.04) 0%, transparent 40%)`,
            }}
          />
          {/* subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(165,180,252,0.6) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(165,180,252,0.6) 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
            }}
          />
          {/* accent glow bottom-right */}
          <div
            className="absolute bottom-0 right-0 w-96 h-48 opacity-20"
            style={{
              background: 'radial-gradient(ellipse at bottom right, #4f46e5 0%, transparent 70%)',
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                N
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  NovaPOS — Finance &amp; Operations
                </h1>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(165,180,252,0.65)' }}>
                  Workspace — All Modules
                </p>
              </div>
            </div>
            <p className="text-sm mt-2 max-w-xl" style={{ color: 'rgba(148,163,184,0.65)' }}>
              Select a workspace to get started. Pinned workspaces appear in your Favorites for quick access.
            </p>
          </div>
        </div>

        {/* tiles grid */}
        <div className="flex-1 p-8">
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}
          >
            {TILES.map((tile) => {
              const Icon = tile.icon
              const isTeal = tile.accent === 'teal'
              return (
                <button
                  key={tile.name}
                  className="flex items-center gap-3 px-4 py-4 rounded-xl text-left transition-all duration-200 group"
                  style={{
                    background: '#1a2035',
                    border: '1px solid rgba(99,102,241,0.16)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.borderColor = isTeal
                      ? 'rgba(8,145,178,0.45)'
                      : 'rgba(99,102,241,0.42)'
                    el.style.background = isTeal
                      ? 'rgba(8,145,178,0.06)'
                      : 'rgba(79,70,229,0.07)'
                    el.style.boxShadow = isTeal
                      ? '0 4px 24px rgba(8,145,178,0.12)'
                      : '0 4px 24px rgba(79,70,229,0.12)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.borderColor = 'rgba(99,102,241,0.16)'
                    el.style.background = '#1a2035'
                    el.style.boxShadow = 'none'
                  }}
                >
                  {/* circular icon */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: '#0f1729',
                      border: isTeal
                        ? '1px solid rgba(8,145,178,0.35)'
                        : '1px solid rgba(79,70,229,0.3)',
                    }}
                  >
                    <Icon
                      className="w-4.5 h-4.5"
                      size={18}
                      style={{ color: isTeal ? '#22d3ee' : '#a5b4fc' }}
                    />
                  </div>
                  {/* module name */}
                  <span
                    className="text-[11.5px] font-medium leading-snug"
                    style={{ color: 'rgba(203,213,225,0.88)' }}
                  >
                    {tile.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
