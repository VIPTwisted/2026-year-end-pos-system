'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, ShoppingCart, Package, Users, Warehouse,
  Building2, HeadphonesIcon, DollarSign, Megaphone, Wrench,
  Settings, ChevronRight, Store, Map,
  CreditCard, CalendarDays, CheckSquare, GraduationCap,
  ArrowDownCircle, PieChart, FileText, Sliders, BarChart3,
  Target, Percent, Banknote, Boxes, Calculator, Tag, Gift, Star,
  SlidersHorizontal, Layers, ListChecks, Receipt, TrendingUp,
  ShoppingBag, Truck, RotateCcw,
  Globe, Globe2, Monitor, Cpu, Clock, MessageCircle,
  Layout, Puzzle, Palette,
  Languages, Type,
  GitBranch, Settings2, Play, Ban,
  Phone, Shield, RefreshCw,
  CheckCircle, ClipboardList, AlertTriangle, FlaskConical, FileSearch,
  PackageCheck, ArrowLeftRight, Send, Calendar,
  Users2, List, User, Mail,
  Building,
  BarChart2, FileBarChart,
  BookOpen, Search, Image,
  FolderOpen,
  Printer, FileCheck, Eye,
  Umbrella, PiggyBank,
  UserPlus,
  Zap, History, Bell,
  Radio, Video,
  Network, Link as LinkIcon,
  Repeat, TrendingDown,
  Moon, ShieldAlert,
  Database, Brain, MapPin, ThumbsUp, Sparkles, Bot, Handshake,
  Server, Key, Activity, Download, Gauge,
} from 'lucide-react'

type NavItem =
  | { type?: undefined; label: string; href: string; icon: React.ComponentType<{ className?: string }> }
  | { type: 'section'; label: string }

const NAV: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'POS Terminal', href: '/pos', icon: ShoppingCart },

  { type: 'section', label: 'Retail & Commerce' },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Attributes', href: '/products/attributes', icon: SlidersHorizontal },
  { label: 'Assortments', href: '/assortments', icon: Layers },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Orders', href: '/orders', icon: ShoppingCart },
  { label: 'Customer Orders', href: '/customer-orders', icon: ShoppingBag },
  { label: 'Fulfillment', href: '/fulfillment', icon: Truck },
  { label: 'Returns', href: '/returns', icon: RotateCcw },
  { label: 'Gift Cards', href: '/gift-cards', icon: Gift },
  { label: 'Loyalty', href: '/loyalty', icon: Star },
  { label: 'Pricing', href: '/pricing', icon: Tag },
  { label: 'Price Books', href: '/pricing/price-books', icon: BookOpen },
  { label: 'Price Rules', href: '/pricing/rules', icon: Sliders },
  { label: 'Customer Groups', href: '/pricing/customer-groups', icon: Users },
  { label: 'Price Simulator', href: '/pricing/simulate', icon: Play },

  { type: 'section', label: 'Merchandising' },
  { label: 'Catalogs', href: '/ecom/catalogs', icon: BookOpen },
  { label: 'E-Commerce Products', href: '/ecom/products', icon: Package },
  { label: 'Ratings & Reviews', href: '/ecom/ratings', icon: Star },
  { label: 'Search Config', href: '/ecom/search-config', icon: Search },
  { label: 'Banners', href: '/ecom/banners', icon: Image },
  { label: 'Recommendations', href: '/recommendations', icon: Sparkles },

  { type: 'section', label: 'Inventory Management' },
  { label: 'Inventory', href: '/inventory', icon: Warehouse },
  { label: 'Warehouse', href: '/warehouse', icon: Warehouse },
  { label: 'Inbound Shipments', href: '/inventory-ops/inbound', icon: PackageCheck },
  { label: 'Transfers', href: '/inventory-ops/transfers', icon: ArrowLeftRight },
  { label: "Buyer's Push", href: '/inventory-ops/buyers-push', icon: Send },
  { label: 'Replenishment', href: '/inventory-ops/replenishment', icon: RefreshCw },
  { label: 'Quality', href: '/quality', icon: CheckCircle },
  { label: 'Quality Orders', href: '/quality/orders', icon: ClipboardList },
  { label: 'Non-Conformances', href: '/quality/nc', icon: AlertTriangle },
  { label: 'Test Groups', href: '/quality/test-groups', icon: FlaskConical },
  { label: 'Inspection Plans', href: '/quality/plans', icon: FileSearch },
  { label: 'Physical Count', href: '/inventory/physical-count', icon: ListChecks },
  { label: 'Lot Tracking', href: '/inventory/lot-tracking', icon: Tag },
  { label: 'Serial Numbers', href: '/inventory/serial-numbers', icon: Key },
  { label: 'Landed Costs', href: '/purchasing/landed-costs', icon: Truck },

  { type: 'section', label: 'Manufacturing' },
  { label: 'Overview', href: '/manufacturing', icon: Cpu },
  { label: 'Production Orders', href: '/manufacturing/production-orders', icon: ClipboardList },
  { label: 'BOMs', href: '/manufacturing/boms', icon: Layers },
  { label: 'BOM Routing', href: '/manufacturing/bom-routing', icon: GitBranch },
  { label: 'Routings', href: '/manufacturing/routings', icon: Network },
  { label: 'Work Centers', href: '/manufacturing/work-centers', icon: Settings2 },
  { label: 'Subcontracting', href: '/manufacturing/subcontracting', icon: Handshake },
  { label: 'Mfg Quality', href: '/manufacturing/quality', icon: CheckCircle },

  { type: 'section', label: 'Procurement & Sourcing' },
  { label: 'Purchase Orders', href: '/purchasing', icon: Building2 },
  { label: 'Vendor Directory', href: '/vp-vendors', icon: Building2 },
  { label: 'Vendor Invoices', href: '/vp-invoices', icon: Receipt },
  { label: 'Documents', href: '/vp-documents', icon: FolderOpen },
  { label: 'Vendors / AP', href: '/vendors', icon: Building2 },

  { type: 'section', label: 'Commerce HQ' },
  { label: 'Channels', href: '/channels', icon: Globe },
  { label: 'CSU Management', href: '/channels/csu', icon: Server },
  { label: 'BOPIS / Pickup', href: '/channels/bopis', icon: PackageCheck },
  { label: 'Hardware Profiles', href: '/channels/hardware-profiles', icon: Cpu },
  { label: 'Registers', href: '/channels/registers', icon: Monitor },
  { label: 'Receipt Profiles', href: '/channels/receipt-profiles', icon: Printer },
  { label: 'Payment Connectors', href: '/channels/payment-connectors', icon: CreditCard },
  { label: 'Fulfillment Groups', href: '/channels/fulfillment-groups', icon: Truck },
  { label: 'POS Operations', href: '/settings/pos-operations', icon: Settings },
  { label: 'Shift Management', href: '/commerce/shifts', icon: Clock },

  { type: 'section', label: 'Finance' },
  { label: 'Overview', href: '/finance', icon: DollarSign },
  { label: 'GL Journal', href: '/finance/gl', icon: FileText },
  { label: 'Posting Profiles', href: '/finance/posting-profiles', icon: Sliders },
  { label: 'AR / Receivables', href: '/ar', icon: ArrowDownCircle },
  { label: 'Bank Accounts', href: '/bank', icon: CreditCard },
  { label: 'Fixed Assets', href: '/finance/fixed-assets', icon: Boxes },
  { label: 'Cost Accounting', href: '/finance/cost-accounting', icon: Calculator },
  { label: 'Budget', href: '/budget', icon: PieChart },
  { label: 'Budget Plans', href: '/budget/plans', icon: Target },
  { label: 'Statements', href: '/statements', icon: Receipt },
  { label: 'Fiscal Calendar', href: '/fiscal', icon: CalendarDays },
  { label: 'Year-End Close', href: '/year-end', icon: CheckSquare },
  { label: 'Tax Management', href: '/finance/tax', icon: Percent },
  { label: 'Credit Management', href: '/finance/credit-management', icon: Shield },
  { label: 'Collections', href: '/finance/collections', icon: TrendingDown },
  { label: 'Interest', href: '/finance/interest', icon: Percent },
  { label: 'Cash Discounts', href: '/finance/cash-discounts', icon: Tag },
  { label: 'Prepayments', href: '/finance/prepayments', icon: CreditCard },

  { type: 'section', label: 'Human Resources' },
  { label: 'Employees', href: '/hr/employees', icon: Users },
  { label: 'Payroll', href: '/hr/payroll', icon: Banknote },
  { label: 'Scheduling', href: '/hr/scheduling', icon: CalendarDays },
  { label: 'Time & Attendance', href: '/hr/time-attendance', icon: Clock },
  { label: 'Leave Management', href: '/hr/leave', icon: Umbrella },
  { label: 'Leave Balances', href: '/hr/leave-balances', icon: PiggyBank },
  { label: 'Training', href: '/hr/training', icon: GraduationCap },

  { type: 'section', label: 'Sales' },
  { label: 'Sales Pipeline', href: '/sales', icon: TrendingUp },
  { label: 'Leads', href: '/sales/leads', icon: UserPlus },
  { label: 'Opportunities', href: '/sales/opportunities', icon: Target },
  { label: 'Quotes', href: '/sales/quotes', icon: FileText },
  { label: 'Sales Orders', href: '/sales/orders', icon: ShoppingBag },
  { label: 'Invoices', href: '/sales/invoices', icon: Receipt },
  { label: 'Forecasting', href: '/sales/forecasting', icon: BarChart2 },
  { label: 'Sequences', href: '/sales/sequences', icon: GitBranch },
  { label: 'Competitors', href: '/sales/competitors', icon: Layers },

  { type: 'section', label: 'Customer Service' },
  { label: 'Overview', href: '/service', icon: HeadphonesIcon },
  { label: 'Case Queue', href: '/service/cases', icon: ClipboardList },
  { label: 'Service Orders', href: '/service/orders', icon: ShoppingBag },
  { label: 'Service Items', href: '/service/items', icon: Package },
  { label: 'Contracts', href: '/service/contracts', icon: FileText },
  { label: 'Warranties', href: '/service/warranties', icon: Shield },
  { label: 'Entitlements', href: '/service/entitlements', icon: FileCheck },
  { label: 'Dispatch Board', href: '/service/dispatch', icon: MapPin },
  { label: 'Schedule', href: '/service/schedule', icon: Calendar },
  { label: 'Queues', href: '/service/queues', icon: List },
  { label: 'Chat Console', href: '/service/chat', icon: MessageCircle },
  { label: 'Knowledge Base', href: '/service/knowledge', icon: BookOpen },
  { label: 'SLA Policies', href: '/service/sla', icon: Clock },
  { label: 'Analytics', href: '/service/analytics', icon: BarChart2 },

  { type: 'section', label: 'Customer Insights' },
  { label: 'Overview', href: '/customer-insights', icon: Brain },
  { label: 'Data Sources', href: '/customer-insights/sources', icon: Database },
  { label: 'Customer Profiles', href: '/customer-insights/profiles', icon: Users },
  { label: 'Segments', href: '/customer-insights/segments', icon: Users2 },
  { label: 'Measures', href: '/customer-insights/measures', icon: Activity },
  { label: 'Predictions', href: '/customer-insights/predictions', icon: Gauge },
  { label: 'Enrichments', href: '/customer-insights/enrichments', icon: Sparkles },
  { label: 'Exports', href: '/customer-insights/exports', icon: Download },
  { label: 'Governance', href: '/customer-insights/governance', icon: Shield },
  { label: 'Copilot', href: '/customer-insights/copilot', icon: Bot },

  { type: 'section', label: 'Customer Engagement' },
  { label: 'Accounts', href: '/crm/accounts', icon: Building },
  { label: 'Contacts', href: '/crm/contacts', icon: User },
  { label: 'Activities', href: '/crm/activities', icon: Activity },
  { label: 'Entitlements', href: '/crm/entitlements', icon: FileCheck },
  { label: 'Service Contracts', href: '/crm/contracts', icon: FileText },
  { label: 'Clienteling', href: '/clienteling', icon: Users2 },
  { label: 'Client Lists', href: '/clienteling/lists', icon: List },
  { label: 'Customer 360', href: '/clienteling/customers', icon: User },
  { label: 'Associate Tasks', href: '/clienteling/tasks', icon: CheckSquare },
  { label: 'Outreach Templates', href: '/clienteling/templates', icon: Mail },

  { type: 'section', label: 'Call Center' },
  { label: 'Orders', href: '/call-center/orders/new', icon: ShoppingCart },
  { label: 'RMA / Returns', href: '/call-center/rmas', icon: RotateCcw },
  { label: 'Continuity', href: '/call-center/continuity', icon: RefreshCw },
  { label: 'Fraud Rules', href: '/call-center/fraud-rules', icon: Shield },
  { label: 'Scripts', href: '/call-center/scripts', icon: FileText },

  { type: 'section', label: 'Store Operations' },
  { label: 'Store Journal', href: '/store-ops/journal', icon: BookOpen },
  { label: 'Day-End Close', href: '/store-ops/day-end', icon: Moon },
  { label: 'Cash Management', href: '/store-ops/cash', icon: Banknote },
  { label: 'Manager Overrides', href: '/store-ops/overrides', icon: ShieldAlert },
  { label: 'Alerts', href: '/store-ops/alerts', icon: Bell },
  { label: 'Store Locator', href: '/store-locator', icon: MapPin },

  { type: 'section', label: 'Order Management (DOM)' },
  { label: 'DOM Hub', href: '/dom', icon: GitBranch },
  { label: 'DOM Profiles', href: '/dom/profiles', icon: Settings2 },
  { label: 'Run History', href: '/dom/runs', icon: Play },
  { label: 'Exclusions', href: '/dom/exclusions', icon: Ban },

  { type: 'section', label: 'Planning & Forecasting' },
  { label: 'Master Plans', href: '/planning/master-plans', icon: Calendar },
  { label: 'Demand Forecasts', href: '/planning/forecasts', icon: TrendingUp },
  { label: 'Coverage Groups', href: '/planning/coverage-groups', icon: Layers },
  { label: 'Safety Stock', href: '/planning/safety-stock', icon: Shield },
  { label: 'Reorder Triggers', href: '/forecasting/triggers', icon: AlertTriangle },
  { label: 'Replenishment Runs', href: '/forecasting/suggestions', icon: RefreshCw },

  { type: 'section', label: 'Fraud Protection' },
  { label: 'Overview', href: '/fraud', icon: ShieldAlert },
  { label: 'Fraud Rules', href: '/fraud/rules', icon: Shield },
  { label: 'Fraud Reviews', href: '/fraud/reviews', icon: Eye },
  { label: 'Blocked Entities', href: '/fraud/blocked', icon: Ban },

  { type: 'section', label: 'Compliance' },
  { label: 'Tax Overview', href: '/tax', icon: Receipt },
  { label: 'Tax Groups', href: '/tax/groups', icon: Layers },
  { label: 'Tax Nexus', href: '/tax/nexus', icon: Map },
  { label: 'Tax Exemptions', href: '/tax/exemptions', icon: FileCheck },
  { label: 'Info Codes', href: '/info-codes', icon: List },
  { label: 'Fiscal Integration', href: '/fiscal-integration', icon: Shield },
  { label: 'Fiscal Devices', href: '/fiscal-integration/devices', icon: Printer },
  { label: 'Fiscal Documents', href: '/fiscal-integration/documents', icon: FileCheck },
  { label: 'Fiscal Periods', href: '/fiscal-integration/periods', icon: Calendar },
  { label: 'Audit Trail', href: '/fiscal-integration/audit', icon: Eye },
  { label: 'E-Receipts', href: '/fiscal-integration/receipts', icon: Mail },
  { label: 'Receipt Templates', href: '/fiscal-integration/receipt-templates', icon: Layout },

  { type: 'section', label: 'Marketing & Automation' },
  { label: 'Marketing', href: '/marketing', icon: Megaphone },
  { label: 'Campaigns', href: '/crm/campaigns', icon: Send },
  { label: 'CRM Segments', href: '/crm/segments', icon: Users },
  { label: 'Email Overview', href: '/email', icon: Mail },
  { label: 'SMTP Profiles', href: '/email/smtp', icon: Send },
  { label: 'Email Templates', href: '/email/templates', icon: FileText },
  { label: 'Email Logs', href: '/email/logs', icon: History },
  { label: 'Events', href: '/crm/events', icon: CalendarDays },
  { label: 'Automation', href: '/automation', icon: Zap },
  { label: 'Workflows', href: '/automation/workflows', icon: GitBranch },
  { label: 'Business Rules', href: '/automation/rules', icon: BookOpen },
  { label: 'Automation History', href: '/automation/runs', icon: History },
  { label: 'Notifications', href: '/automation/notifications', icon: Bell },

  { type: 'section', label: 'E-Commerce' },
  { label: 'Site Builder', href: '/site-builder', icon: Layout },
  { label: 'Pages', href: '/site-builder', icon: FileText },
  { label: 'Fragments', href: '/site-builder/fragments', icon: Puzzle },
  { label: 'Themes', href: '/site-builder/themes', icon: Palette },
  { label: 'Site Menus', href: '/site-builder/menus', icon: Monitor },
  { label: 'Media Library', href: '/media', icon: Image },
  { label: 'CDN Config', href: '/media/cdn', icon: Globe2 },

  { type: 'section', label: 'Global Commerce' },
  { label: 'Currencies', href: '/global/currencies', icon: DollarSign },
  { label: 'Tax Regions', href: '/global/tax-regions', icon: Receipt },
  { label: 'Languages', href: '/global/languages', icon: Languages },
  { label: 'Translations', href: '/global/translations', icon: Type },
  { label: 'Countries', href: '/global/countries', icon: Map },

  { type: 'section', label: 'B2B Commerce' },
  { label: 'Organizations', href: '/b2b/organizations', icon: Building },
  { label: 'Quotes', href: '/b2b/quotes', icon: FileText },
  { label: 'Requisitions', href: '/b2b/requisitions', icon: ClipboardList },
  { label: 'Price Overrides', href: '/b2b/price-overrides', icon: Tag },

  { type: 'section', label: 'Live Commerce' },
  { label: 'Shows', href: '/live/shows', icon: Video },
  { label: 'Creators', href: '/live/creators', icon: Users2 },
  { label: 'Flash Sales', href: '/live/flash-sales', icon: Zap },

  { type: 'section', label: 'Affiliate & MLM' },
  { label: 'Programs', href: '/affiliate/programs', icon: Target },
  { label: 'Affiliates', href: '/affiliate/affiliates', icon: Users },
  { label: 'Referrals', href: '/affiliate/referrals', icon: LinkIcon },
  { label: 'Commissions', href: '/affiliate/commissions', icon: DollarSign },
  { label: 'Payouts', href: '/affiliate/payouts', icon: CreditCard },

  { type: 'section', label: 'Subscriptions' },
  { label: 'Plans', href: '/subscriptions/plans', icon: Package },
  { label: 'Subscribers', href: '/subscriptions/subscribers', icon: Users },
  { label: 'Billing', href: '/subscriptions/billing', icon: CreditCard },
  { label: 'Recurring Orders', href: '/subscriptions/recurring-orders', icon: Repeat },
  { label: 'Churn Analysis', href: '/subscriptions/churn', icon: TrendingDown },

  { type: 'section', label: 'Analytics & Reporting' },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Analytics', href: '/analytics', icon: TrendingUp },
  { label: 'Advanced Analytics', href: '/advanced-analytics', icon: BarChart2 },
  { label: 'Dashboards', href: '/advanced-analytics/dashboards', icon: LayoutDashboard },
  { label: 'Custom Reports', href: '/advanced-analytics/reports', icon: FileBarChart },
  { label: 'KPI Scorecards', href: '/advanced-analytics/scorecards', icon: Target },
  { label: 'Tasks', href: '/tasks', icon: ListChecks },
  { label: 'Field Service', href: '/field-service', icon: Wrench },

  { type: 'section', label: 'Settings & Admin' },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Users & Roles', href: '/admin/users', icon: Key },
  { label: 'Integrations', href: '/integrations', icon: Handshake },
  { label: 'Stores / HQ', href: '/stores', icon: Store },
  { label: 'Training', href: '/training', icon: GraduationCap },
  { label: 'Module Map', href: '/d365-map', icon: Map },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
          <div>
            <div className="text-sm font-bold text-zinc-100">NovaPOS</div>
            <div className="text-xs text-zinc-500">Enterprise Platform</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV.map((item, i) => {
          if (item.type === 'section') {
            return (
              <div key={`section-${i}`} className="px-3 pt-4 pb-1">
                <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">{item.label}</p>
              </div>
            )
          }
          const { label, href, icon: Icon } = item as { label: string; href: string; icon: React.ComponentType<{ className?: string }> }
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link
              key={`${href}-${i}`}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-1 transition-colors group',
                active
                  ? 'bg-blue-600/20 text-blue-400 font-medium'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3" />}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-zinc-800">
        <div className="text-xs text-zinc-600">NovaPOS Platform v1.0</div>
        <div className="text-xs text-zinc-700">Powered by NovaPOS</div>
      </div>
    </aside>
  )
}
