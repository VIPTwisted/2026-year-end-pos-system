import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import {
  ChevronRight, CheckCircle2, Circle, Monitor, Wifi, Globe,
  LogIn, Store, Package, Users, ShoppingCart,
  Settings, GraduationCap, Shield, BookOpen, AlertTriangle,
} from 'lucide-react'

const CHECKLIST = [
  {
    step: 1,
    title: 'Set Up Your Store',
    desc: 'Configure your store profile, address, tax rates, fiscal calendar, and payment methods in Settings.',
    href: '/settings',
    time: '~10 min',
    tips: [
      'Navigate to Settings → Stores / HQ and fill in your legal business name and address.',
      'Set your default tax code and link it to your product categories.',
      'Configure the fiscal year start date under Settings → Fiscal Calendar.',
      'Add at least one bank account under Bank Accounts before processing any transactions.',
    ],
  },
  {
    step: 2,
    title: 'Add Your Products',
    desc: 'Create your item catalog with barcodes, pricing, cost, and inventory tracking enabled.',
    href: '/products',
    time: '~20–60 min',
    tips: [
      'Use the Products page to create items one-by-one or bulk-import via CSV.',
      'Each item needs a unit of measure, cost price, and at least one selling price.',
      'Enable inventory tracking on items you want to count and reorder automatically.',
      'Assign items to product categories so reports and promotions apply correctly.',
    ],
  },
  {
    step: 3,
    title: 'Add Your Customers',
    desc: 'Import or manually create customer records with contact info, pricing groups, and credit limits.',
    href: '/customers',
    time: '~15–45 min',
    tips: [
      'Walk-in / anonymous sales do not require a customer record — use the Guest option at POS.',
      'For loyalty tracking, each customer needs a unique email or phone number.',
      'Set a customer price group if they receive special pricing or discounts.',
      'Credit limits prevent over-extension of AR — set these before enabling customer invoicing.',
    ],
  },
  {
    step: 4,
    title: 'Run Your First Transaction',
    desc: 'Open the POS terminal, open a shift, scan items, select a payment method, and complete the sale.',
    href: '/pos',
    time: '~5 min',
    tips: [
      'Click "Open Shift" at the POS terminal and enter your opening float amount.',
      'Scan or search for items to add them to the transaction basket.',
      'Select "Charge" to proceed to the payment screen — choose Cash, Card, or Split Tender.',
      'The receipt prints automatically if a receipt printer is configured.',
    ],
  },
  {
    step: 5,
    title: 'Close Your Shift',
    desc: 'Reconcile the cash drawer, print the shift report, and post the shift to the General Ledger.',
    href: '/pos',
    time: '~10 min',
    tips: [
      'Click "Close Shift" at the end of your trading period to begin reconciliation.',
      'Count physical cash and enter the counted amount — NovaPOS shows the expected amount.',
      'Any variance is flagged for manager review before the shift posts.',
      'The shift report posts tender totals to the appropriate GL accounts automatically.',
    ],
  },
]

const SYSTEM_REQS = [
  { label: 'Browser', value: 'Chrome 110+, Firefox 115+, Edge 110+, Safari 16+', icon: Globe },
  { label: 'Display', value: '1280 × 800 minimum (1920 × 1080 recommended for POS)', icon: Monitor },
  { label: 'Internet', value: '5 Mbps minimum per terminal (10+ Mbps recommended)', icon: Wifi },
  { label: 'POS Hardware', value: 'USB or Bluetooth barcode scanner, receipt printer (ESC/POS), cash drawer', icon: Settings },
]

export default function GettingStartedPage() {
  return (
    <>
      <TopBar title="Getting Started" />
      <main className="flex-1 p-6 overflow-auto max-w-4xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
          <Link href="/help" className="hover:text-zinc-300 transition-colors">Help Center</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-400">Getting Started</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100 mb-2">Welcome to NovaPOS</h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
            NovaPOS is a full-featured enterprise retail and commerce platform. It combines point-of-sale,
            inventory management, financial accounting, purchasing, HR, and multi-channel commerce in a single
            unified system. This guide walks you through everything you need to know to get operational.
          </p>
        </div>

        {/* Overview */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 mb-8">
          <h2 className="text-base font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            What NovaPOS Does
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['Point of Sale', 'Process sales, returns, and exchanges on any device. Supports multiple payment types including cash, credit/debit, split tender, and gift cards.'],
              ['Inventory & Warehouse', 'Track stock across multiple locations. Automate purchase orders when items fall below reorder points. Conduct physical counts.'],
              ['Finance & Accounting', 'Full double-entry GL with chart of accounts, journal entries, bank reconciliation, AP/AR, and period close procedures.'],
              ['Purchasing & AP', 'Manage vendor relationships, create and receive purchase orders, match invoices, and run payment batches.'],
              ['Customer & CRM', 'Customer records, loyalty points, AR invoicing, credit limits, and purchase history across all channels.'],
              ['HR & Payroll', 'Employee records, time clock, shift scheduling, and payroll calculation with deductions.'],
              ['Commerce & E-Commerce', 'Multi-channel selling with inventory sync, gift cards, promotions, and shipping integration.'],
              ['Reporting & Analytics', 'Financial statements, sales analytics, inventory valuation, and fully customizable report builder.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-zinc-200">{title}</div>
                  <div className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Requirements */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 mb-8">
          <h2 className="text-base font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-400" />
            System Requirements
          </h2>
          <div className="space-y-3">
            {SYSTEM_REQS.map(req => (
              <div key={req.label} className="flex items-start gap-3 py-2.5 border-b border-zinc-800 last:border-0">
                <req.icon className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                <div className="flex items-start gap-4 flex-wrap">
                  <span className="text-xs font-medium text-zinc-400 w-24 shrink-0">{req.label}</span>
                  <span className="text-xs text-zinc-300">{req.value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-900/20 border border-amber-800/30">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-200">
              NovaPOS requires cookies and local storage to be enabled. Private/incognito mode may cause session issues on POS terminals.
            </p>
          </div>
        </div>

        {/* First Login */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 mb-8">
          <h2 className="text-base font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <LogIn className="w-4 h-4 text-blue-400" />
            First Login Steps
          </h2>
          <ol className="space-y-3">
            {[
              ['Navigate to your NovaPOS URL', 'Open your browser and go to the URL provided by your system administrator. The login page requires your email address and password.'],
              ['Enter your credentials', 'Your administrator will have sent your temporary password by email. Enter your email and temporary password. You will be prompted to set a new password on first login.'],
              ['Set a strong password', 'Your password must be at least 10 characters and contain uppercase, lowercase, numbers, and a symbol. Do not share your password — each user should have a unique login.'],
              ['Review your role and permissions', 'After login, your role (Admin, Manager, Cashier, or Accountant) determines which modules and actions you can access. Contact your administrator to adjust permissions.'],
              ['Configure your profile', 'Click your name in the top-right corner to access your profile settings. Set your display name, preferred date format, and notification preferences.'],
            ].map(([title, desc], i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0 mt-0.5">{i + 1}</div>
                <div>
                  <div className="text-sm font-medium text-zinc-200">{title}</div>
                  <div className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{desc}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Quick Start Checklist */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            5-Step Quick Start Checklist
          </h2>
          <div className="space-y-4">
            {CHECKLIST.map((item, idx) => (
              <div key={item.step} className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
                <div className="flex items-start gap-4 p-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-600/20 flex items-center justify-center text-lg font-bold text-blue-400 shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-zinc-100">{item.title}</h3>
                      <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{item.time}</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-3">{item.desc}</p>
                    <ul className="space-y-1.5">
                      {item.tips.map((tip, ti) => (
                        <li key={ti} className="flex items-start gap-2 text-xs text-zinc-400">
                          <Circle className="w-3 h-3 text-zinc-600 mt-0.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                    <Link href={item.href} className="inline-flex items-center gap-1 mt-3 text-xs text-blue-400 hover:text-blue-300 font-medium">
                      Go to {item.title} <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
                {idx < CHECKLIST.length - 1 && (
                  <div className="h-px bg-zinc-800 mx-5" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Role Guides */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
          <h2 className="text-base font-semibold text-zinc-100 mb-4">Continue Learning by Role</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { role: 'Admin', href: '/help/training/admin', icon: Shield, color: 'text-blue-400' },
              { role: 'Manager', href: '/help/training/manager', icon: Users, color: 'text-violet-400' },
              { role: 'Cashier', href: '/help/training/cashier', icon: ShoppingCart, color: 'text-emerald-400' },
              { role: 'Accountant', href: '/help/training/accountant', icon: GraduationCap, color: 'text-amber-400' },
            ].map(r => (
              <Link
                key={r.role}
                href={r.href}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-all text-center group"
              >
                <r.icon className={`w-5 h-5 ${r.color}`} />
                <span className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100">{r.role} Path</span>
                <ChevronRight className="w-3 h-3 text-zinc-500" />
              </Link>
            ))}
          </div>
        </div>

      </main>
    </>
  )
}
