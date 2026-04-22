import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ChevronRight, FileText, Sparkles, TrendingUp, Bug, Zap } from 'lucide-react'

interface ChangeItem {
  text: string
  tag?: 'new' | 'improved' | 'fixed' | 'performance'
}

interface ReleaseSection {
  label: string
  icon: React.ElementType
  color: string
  bg: string
  items: ChangeItem[]
}

interface Release {
  version: string
  date: string
  codename?: string
  summary: string
  highlight?: string
  sections: ReleaseSection[]
}

const RELEASES: Release[] = [
  {
    version: 'v1.3.0',
    date: 'April 15, 2026',
    codename: 'Horizon',
    summary: 'Major release introducing the AI-powered Insights engine, multi-currency payment processing, and a redesigned report builder with drag-and-drop column management.',
    highlight: 'Largest feature release since launch',
    sections: [
      {
        label: 'New Features',
        icon: Sparkles,
        color: 'text-blue-400',
        bg: 'bg-blue-950/20 border-blue-900/30',
        items: [
          { text: 'AI Insights engine: demand forecasting, anomaly detection, and sales trend predictions powered by store transaction history.' },
          { text: 'Multi-currency payment processing at POS — accept foreign currency, auto-convert at live exchange rates, post in base currency.' },
          { text: 'Drag-and-drop custom report builder with calculated fields, grouping, and one-click PDF/CSV export.' },
          { text: 'Manufacturing module: Bills of Materials, production orders, work center capacity planning, and output posting.' },
          { text: 'E-commerce channel connector for third-party storefronts — inventory sync every 5 minutes, order auto-import.' },
          { text: 'Employee self-service portal: view pay stubs, request time off, and check schedules from any device.' },
          { text: 'Loyalty tier system with automatic annual tier assignment based on prior-year spend.' },
          { text: 'Configurable webhook events for all major NovaPOS record changes — trigger automations in connected systems.' },
        ],
      },
      {
        label: 'Improvements',
        icon: TrendingUp,
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/20 border-emerald-900/30',
        items: [
          { text: 'POS item search now returns results within 80ms — 3× faster than v1.2 due to client-side index caching.' },
          { text: 'Bank reconciliation auto-match algorithm improved: match rate on standard retail deposits increased from 71% to 94%.' },
          { text: 'AP payment run now supports partial payment of invoices and generates a remittance advice PDF per vendor.' },
          { text: 'Period close checklist is now interactive — each step shows completion status in real time as accounting staff work.' },
          { text: 'Dashboard KPIs now refresh every 60 seconds without a full page reload.' },
          { text: 'Mobile-optimized POS layout for 10" tablets: larger touch targets and simplified navigation.' },
          { text: 'Inventory count worksheet supports offline entry with sync-on-reconnect for warehouse environments with spotty Wi-Fi.' },
        ],
      },
      {
        label: 'Bug Fixes',
        icon: Bug,
        color: 'text-red-400',
        bg: 'bg-red-950/20 border-red-900/30',
        items: [
          { text: 'Fixed: sales tax was incorrectly calculated on split-tender transactions when a gift card covered partial payment.' },
          { text: 'Fixed: recurring journal entries with a reversal date were not auto-reversing when the reversal date fell on a weekend.' },
          { text: 'Fixed: inventory on-hand count was not updating when a manufacturing production order was posted as finished.' },
          { text: 'Fixed: customer credit limit check was not triggering on customer orders created through the e-commerce channel.' },
          { text: 'Fixed: report export to PDF was truncating table rows when a report exceeded 500 lines.' },
          { text: 'Fixed: cashier PINs were not enforcing the minimum 4-digit length requirement in certain browsers.' },
          { text: 'Fixed: outstanding check report was including voided checks in the outstanding balance total.' },
        ],
      },
    ],
  },
  {
    version: 'v1.2.0',
    date: 'February 3, 2026',
    codename: 'Summit',
    summary: 'Focused release delivering the full HR & Payroll module, improved purchasing workflows with three-way matching, and a comprehensive keyboard shortcut system across all modules.',
    sections: [
      {
        label: 'New Features',
        icon: Sparkles,
        color: 'text-blue-400',
        bg: 'bg-blue-950/20 border-blue-900/30',
        items: [
          { text: 'HR & Payroll module: employee records, departments, time clock with break tracking, payroll calculation, and pay stub generation.' },
          { text: 'Three-way PO matching: NovaPOS automatically flags AP invoices where quantity or cost deviates from the PO receipt.' },
          { text: 'Full keyboard shortcut system: 60+ shortcuts covering POS terminal, navigation, finance, and reporting.' },
          { text: 'Shift override workflow: cashiers can request manager overrides for discounts and returns directly from the POS without leaving the screen.' },
          { text: 'Promotional campaign reporting: revenue impact, discount total, and transaction count for every active promotion.' },
          { text: 'Vendor statement reconciliation tool: match vendor statements to NovaPOS AP records and identify discrepancies.' },
          { text: 'Fixed asset depreciation module: straight-line and declining balance methods, automatic monthly depreciation journals.' },
        ],
      },
      {
        label: 'Improvements',
        icon: TrendingUp,
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/20 border-emerald-900/30',
        items: [
          { text: 'Purchase order email now includes a link for vendors to acknowledge the PO electronically.' },
          { text: 'AR aging report now shows the primary contact name and phone number for each overdue customer to streamline collection calls.' },
          { text: 'Chart of accounts list view now supports inline editing for account names without opening the full record.' },
          { text: 'Barcode scanning on inventory count worksheets now plays an audio confirmation tone on successful scan.' },
          { text: 'Customer card "History" tab now shows all channel orders (POS, e-commerce, customer orders) in a unified timeline.' },
          { text: 'Fiscal period close now validates that all bank accounts are reconciled before allowing the period to close.' },
        ],
      },
      {
        label: 'Bug Fixes',
        icon: Bug,
        color: 'text-red-400',
        bg: 'bg-red-950/20 border-red-900/30',
        items: [
          { text: 'Fixed: inventory transfer receipts were not updating the destination location quantity when the source and destination were in the same store.' },
          { text: 'Fixed: customer loyalty points were being calculated on the pre-discount subtotal instead of the post-discount subtotal.' },
          { text: 'Fixed: the budget vs actual report was showing a double-counted variance for accounts that had both manual journals and automated postings in the same period.' },
          { text: 'Fixed: adding a second barcode to an item card was overwriting the first barcode instead of creating an additional barcode record.' },
          { text: 'Fixed: the daily sales report was excluding transactions from the last minute of the selected date due to a timezone comparison error.' },
        ],
      },
    ],
  },
  {
    version: 'v1.1.0',
    date: 'December 10, 2025',
    codename: 'Foundation',
    summary: 'First major update after launch — adds the full Commerce module (gift cards, promotions, e-commerce scaffolding), multi-store inventory transfers, and significant POS performance improvements.',
    sections: [
      {
        label: 'New Features',
        icon: Sparkles,
        color: 'text-blue-400',
        bg: 'bg-blue-950/20 border-blue-900/30',
        items: [
          { text: 'Gift card module: issue, activate, reload, and redeem gift cards at POS and online. Full liability GL integration.' },
          { text: 'Promotions engine: percentage, fixed-amount, buy-X-get-Y, and bundle promotions with date ranges and priority rules.' },
          { text: 'Multi-store inventory transfers with shipment and receipt posting — reduces inventory at source, increases at destination.' },
          { text: 'Customer loyalty program foundation: points earning, redemption at POS, and balance display on customer card.' },
          { text: 'Budget module: create annual budgets by GL account and period, compare to actuals in financial reports.' },
          { text: 'CRM pipeline integration: track sales opportunities from prospect to close, linked to customer records.' },
          { text: 'Fraud protection rules: flag high-risk transactions (large cash refunds, excessive voids) for manager review.' },
          { text: 'Approval workflows for POs and high-value transactions with configurable dollar thresholds per user role.' },
        ],
      },
      {
        label: 'Performance',
        icon: Zap,
        color: 'text-amber-400',
        bg: 'bg-amber-950/20 border-amber-900/30',
        items: [
          { text: 'POS terminal initial load time reduced from 4.2s to 1.1s through component lazy loading and pre-fetched item index.' },
          { text: 'GL posting engine refactored to process up to 5,000 journal lines per second — 10× improvement over v1.0.' },
          { text: 'Dashboard data API response time reduced from 800ms to 120ms via materialized view caching.' },
          { text: 'Inventory stock level queries optimized with composite index — inventory report generation 60% faster.' },
        ],
      },
      {
        label: 'Bug Fixes',
        icon: Bug,
        color: 'text-red-400',
        bg: 'bg-red-950/20 border-red-900/30',
        items: [
          { text: 'Fixed: POS shift could be opened twice if the Open Shift button was double-clicked rapidly, causing duplicate float entries.' },
          { text: 'Fixed: AP invoices matched to a PO were showing the PO date instead of the invoice date on the aging report.' },
          { text: 'Fixed: deleting a product category was cascading and removing the category assignment from all child items instead of setting it to blank.' },
          { text: 'Fixed: the cash flow statement was mis-classifying certain inter-bank transfers as operating activities instead of financing activities.' },
          { text: 'Fixed: email receipts were not attaching the receipt PDF when the transaction included a loyalty point redemption.' },
        ],
      },
    ],
  },
  {
    version: 'v1.0.0',
    date: 'November 1, 2025',
    codename: 'Genesis',
    summary: 'Initial release of NovaPOS Enterprise Platform. Full POS, Finance, Inventory, Customers, Sales, Purchasing, Reporting, and Settings modules. Built for multi-store retail and commerce operations.',
    sections: [
      {
        label: 'Initial Release Features',
        icon: Sparkles,
        color: 'text-blue-400',
        bg: 'bg-blue-950/20 border-blue-900/30',
        items: [
          { text: 'Full point-of-sale terminal: item search, barcode scanning, multi-tender payment, split tender, receipt printing, and email receipts.' },
          { text: 'Shift management: opening float, close with cash count reconciliation, shift report, and GL auto-posting.' },
          { text: 'General ledger with full double-entry accounting, chart of accounts, journal entries, and posting profiles.' },
          { text: 'Accounts Receivable: customer invoices, payment application, aging reports, credit holds, and payment reminders.' },
          { text: 'Accounts Payable: vendor invoices, payment runs, AP aging, and check printing.' },
          { text: 'Bank accounts and bank reconciliation with statement import (OFX, CSV) and auto-matching.' },
          { text: 'Fiscal calendar with period management, period close, and year-end close wizard.' },
          { text: 'Inventory management: item cards, stock on hand, stock adjustments, and reorder point alerts.' },
          { text: 'Purchase orders: vendor management, PO creation, goods receipt, and three-way match preparation.' },
          { text: 'Sales module: quotes, orders, shipments, invoices, returns, and credit memos.' },
          { text: 'Customer management: customer cards, contact info, payment terms, purchase history, and pricing groups.' },
          { text: 'Multi-store support: store profiles, register configuration, tender type setup, and store-level GL mapping.' },
          { text: 'User management: role-based access control, PIN-based POS login, audit logging, and session management.' },
          { text: 'Standard reports: Income Statement, Balance Sheet, Trial Balance, AR Aging, AP Aging, Daily Sales Summary.' },
          { text: 'Tax management: tax codes, compound tax support, tax posting accounts, and tax reports.' },
          { text: 'Settings: company info, fiscal calendar, currencies, receipt templates, and system preferences.' },
        ],
      },
    ],
  },
]

const TAG_COLORS: Record<string, string> = {
  new: 'bg-blue-900/30 text-blue-300 border-blue-800/50',
  improved: 'bg-emerald-900/30 text-emerald-300 border-emerald-800/50',
  fixed: 'bg-red-900/30 text-red-300 border-red-800/50',
  performance: 'bg-amber-900/30 text-amber-300 border-amber-800/50',
}

export default function ReleaseNotesPage() {
  return (
    <>
      <TopBar title="Release Notes" />
      <main className="flex-1 p-6 overflow-auto max-w-4xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
          <Link href="/help" className="hover:text-zinc-300 transition-colors">Help Center</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-400">Release Notes</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700">
              <FileText className="w-6 h-6 text-zinc-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">NovaPOS Release Notes</h1>
              <p className="text-sm text-zinc-500 mt-0.5">Full changelog for every NovaPOS version — new features, improvements, and bug fixes.</p>
            </div>
          </div>
        </div>

        {/* Version Jump Nav */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {RELEASES.map(r => (
            <a
              key={r.version}
              href={`#${r.version}`}
              className="text-xs px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 transition-colors font-mono"
            >
              {r.version}
            </a>
          ))}
        </div>

        {/* Releases */}
        <div className="space-y-12">
          {RELEASES.map((release, ri) => (
            <div key={release.version} id={release.version} className="scroll-mt-20">
              {/* Release Header */}
              <div className="flex items-start justify-between mb-5 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <h2 className="text-xl font-bold text-zinc-100 font-mono">{release.version}</h2>
                    {ri === 0 && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-600/20 border border-blue-600/30 text-blue-400">
                        Latest
                      </span>
                    )}
                    {release.codename && (
                      <span className="text-xs text-zinc-500">&ldquo;{release.codename}&rdquo;</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mb-2">{release.date}</p>
                  <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">{release.summary}</p>
                  {release.highlight && (
                    <p className="text-xs text-amber-400 font-medium mt-2">{release.highlight}</p>
                  )}
                </div>
              </div>

              {/* Change Sections */}
              <div className="space-y-5">
                {release.sections.map(section => (
                  <div key={section.label} className={`rounded-xl border p-5 ${section.bg}`}>
                    <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${section.color}`}>
                      <section.icon className="w-4 h-4" />
                      {section.label}
                    </h3>
                    <ul className="space-y-2">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-400">
                          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${section.color.replace('text-', 'bg-')}`} />
                          <span className="leading-relaxed">{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </main>
    </>
  )
}
