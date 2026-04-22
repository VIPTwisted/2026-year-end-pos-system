import { NextRequest, NextResponse } from 'next/server'

interface HelpArticle {
  id: string
  title: string
  description: string
  module: string
  url: string
  tags: string[]
}

const ARTICLES: HelpArticle[] = [
  // Getting Started
  { id: 'gs-1', title: 'Welcome to NovaPOS', description: 'Overview of the NovaPOS enterprise platform and its core capabilities.', module: 'Getting Started', url: '/help/getting-started', tags: ['welcome', 'overview', 'intro', 'start'] },
  { id: 'gs-2', title: 'System Requirements', description: 'Minimum hardware and browser requirements to run NovaPOS.', module: 'Getting Started', url: '/help/getting-started', tags: ['requirements', 'system', 'browser', 'hardware'] },
  { id: 'gs-3', title: 'First Login & User Setup', description: 'How to log in for the first time and configure your user profile.', module: 'Getting Started', url: '/help/getting-started', tags: ['login', 'user', 'profile', 'setup', 'password'] },
  { id: 'gs-4', title: 'Quick Start Checklist', description: 'Five-step checklist to get your store operational from day one.', module: 'Getting Started', url: '/help/getting-started', tags: ['quickstart', 'checklist', 'setup', 'store'] },

  // POS
  { id: 'pos-1', title: 'POS Terminal Guide', description: 'Complete walkthrough of the NovaPOS point-of-sale terminal interface.', module: 'POS', url: '/help/modules/pos', tags: ['pos', 'terminal', 'cashier', 'register'] },
  { id: 'pos-2', title: 'Shift Management', description: 'Opening and closing shifts, float management, and shift reconciliation.', module: 'POS', url: '/help/modules/pos', tags: ['shift', 'open', 'close', 'float', 'reconcile'] },
  { id: 'pos-3', title: 'Payment Types', description: 'Accepted payment methods: cash, card, split tender, gift cards, and store credit.', module: 'POS', url: '/help/modules/pos', tags: ['payment', 'cash', 'card', 'gift', 'tender', 'credit'] },
  { id: 'pos-4', title: 'Processing Returns & Exchanges', description: 'How to process customer returns, exchanges, and issue refunds at the POS.', module: 'POS', url: '/help/modules/pos', tags: ['return', 'refund', 'exchange', 'receipt'] },
  { id: 'pos-5', title: 'Suspend & Recall Transactions', description: 'Parking a transaction and recalling it on the same or different terminal.', module: 'POS', url: '/help/modules/pos', tags: ['suspend', 'recall', 'park', 'transaction'] },

  // Finance
  { id: 'fin-1', title: 'Chart of Accounts Setup', description: 'Creating and managing your general ledger chart of accounts in NovaPOS.', module: 'Finance', url: '/help/modules/finance', tags: ['chart', 'accounts', 'gl', 'ledger', 'coa'] },
  { id: 'fin-2', title: 'Journal Entries', description: 'Creating manual journal entries, recurring journals, and batch posting.', module: 'Finance', url: '/help/modules/finance', tags: ['journal', 'entry', 'gl', 'posting', 'debit', 'credit'] },
  { id: 'fin-3', title: 'Bank Reconciliation', description: 'Step-by-step guide to reconciling bank statements against NovaPOS records.', module: 'Finance', url: '/help/modules/finance', tags: ['bank', 'reconciliation', 'statement', 'match'] },
  { id: 'fin-4', title: 'Period Close Procedures', description: 'Month-end and year-end close checklist and posting procedures.', module: 'Finance', url: '/help/modules/finance', tags: ['period', 'close', 'month-end', 'year-end', 'fiscal'] },
  { id: 'fin-5', title: 'Budget Management', description: 'Creating budgets, tracking actuals vs budget, and variance reporting.', module: 'Finance', url: '/help/modules/finance', tags: ['budget', 'forecast', 'variance', 'actuals'] },

  // Inventory
  { id: 'inv-1', title: 'Item Cards', description: 'Creating and maintaining item records including costs, pricing, and attributes.', module: 'Inventory', url: '/help/modules/inventory', tags: ['item', 'product', 'card', 'sku', 'barcode'] },
  { id: 'inv-2', title: 'Physical Stock Counts', description: 'Scheduling and conducting physical inventory counts and adjustments.', module: 'Inventory', url: '/help/modules/inventory', tags: ['stock', 'count', 'physical', 'inventory', 'adjustment'] },
  { id: 'inv-3', title: 'Inventory Transfers', description: 'Moving stock between locations, warehouses, and stores.', module: 'Inventory', url: '/help/modules/inventory', tags: ['transfer', 'location', 'warehouse', 'move', 'stock'] },
  { id: 'inv-4', title: 'Purchase Orders', description: 'Creating purchase orders, receiving goods, and updating inventory.', module: 'Inventory', url: '/help/modules/inventory', tags: ['purchase', 'order', 'po', 'receive', 'vendor'] },
  { id: 'inv-5', title: 'Reorder Points & Auto-Replenishment', description: 'Setting minimum stock levels and automating purchase order creation.', module: 'Inventory', url: '/help/modules/inventory', tags: ['reorder', 'replenish', 'minimum', 'auto', 'low stock'] },

  // Customers
  { id: 'cust-1', title: 'Customer Card', description: 'Managing customer records, contact info, pricing groups, and history.', module: 'Customers', url: '/help/modules/customers', tags: ['customer', 'card', 'contact', 'account', 'profile'] },
  { id: 'cust-2', title: 'Loyalty Program', description: 'Setting up and managing the NovaPOS customer loyalty and points program.', module: 'Customers', url: '/help/modules/customers', tags: ['loyalty', 'points', 'rewards', 'tier', 'program'] },
  { id: 'cust-3', title: 'AR Invoices & Collections', description: 'Creating customer invoices, applying payments, and managing collections.', module: 'Customers', url: '/help/modules/customers', tags: ['ar', 'invoice', 'receivable', 'payment', 'collection', 'due'] },
  { id: 'cust-4', title: 'Customer Orders', description: 'Creating and fulfilling customer sales orders and special orders.', module: 'Customers', url: '/help/modules/customers', tags: ['order', 'sales', 'customer', 'fulfillment', 'special'] },

  // Sales
  { id: 'sales-1', title: 'Sales Quotes', description: 'Creating, sending, and converting sales quotes to orders.', module: 'Sales', url: '/help/modules/sales', tags: ['quote', 'estimate', 'proposal', 'sales'] },
  { id: 'sales-2', title: 'Sales Orders', description: 'Managing the full lifecycle of sales orders from entry to fulfillment.', module: 'Sales', url: '/help/modules/sales', tags: ['order', 'sales', 'fulfillment', 'ship', 'pick'] },
  { id: 'sales-3', title: 'Sales Invoices', description: 'Generating and posting sales invoices to customer accounts.', module: 'Sales', url: '/help/modules/sales', tags: ['invoice', 'billing', 'sales', 'post'] },
  { id: 'sales-4', title: 'Returns & Credit Memos', description: 'Processing sales returns, issuing credit memos, and reverse postings.', module: 'Sales', url: '/help/modules/sales', tags: ['return', 'credit', 'memo', 'refund', 'reverse'] },

  // Purchasing
  { id: 'pur-1', title: 'Vendor Management', description: 'Creating vendor cards, payment terms, and vendor bank accounts.', module: 'Purchasing', url: '/help/modules/purchasing', tags: ['vendor', 'supplier', 'ap', 'payable', 'terms'] },
  { id: 'pur-2', title: 'Purchase Order Workflow', description: 'Creating, approving, and releasing purchase orders to vendors.', module: 'Purchasing', url: '/help/modules/purchasing', tags: ['purchase', 'order', 'po', 'approve', 'release'] },
  { id: 'pur-3', title: 'Receiving Goods', description: 'Posting receipts, partial receipts, and over/under receipt handling.', module: 'Purchasing', url: '/help/modules/purchasing', tags: ['receive', 'goods', 'receipt', 'warehouse', 'inspection'] },
  { id: 'pur-4', title: 'AP Invoices & Payments', description: 'Matching invoices to POs, payment runs, and vendor statement reconciliation.', module: 'Purchasing', url: '/help/modules/purchasing', tags: ['ap', 'invoice', 'payment', 'payable', 'match', 'three-way'] },

  // HR
  { id: 'hr-1', title: 'Employee Records', description: 'Creating and maintaining employee profiles, roles, and access levels.', module: 'HR', url: '/help/modules/hr', tags: ['employee', 'staff', 'hr', 'record', 'profile'] },
  { id: 'hr-2', title: 'Time Clock & Attendance', description: 'Clock-in/out workflows, break management, and attendance reporting.', module: 'HR', url: '/help/modules/hr', tags: ['time', 'clock', 'attendance', 'break', 'hours'] },
  { id: 'hr-3', title: 'Payroll Processing', description: 'Running payroll, calculating wages, deductions, and generating pay stubs.', module: 'HR', url: '/help/modules/hr', tags: ['payroll', 'wages', 'salary', 'deduction', 'pay stub'] },

  // Reporting
  { id: 'rep-1', title: 'Financial Reports', description: 'Balance sheet, income statement, cash flow, and trial balance reports.', module: 'Reporting', url: '/help/modules/reporting', tags: ['financial', 'balance sheet', 'income', 'cash flow', 'trial balance'] },
  { id: 'rep-2', title: 'Sales Analytics', description: 'Sales by period, product, cashier, and location analytics dashboards.', module: 'Reporting', url: '/help/modules/reporting', tags: ['sales', 'analytics', 'dashboard', 'revenue', 'trend'] },
  { id: 'rep-3', title: 'Inventory Reports', description: 'Stock valuation, turnover, aging, and movement reports.', module: 'Reporting', url: '/help/modules/reporting', tags: ['inventory', 'stock', 'valuation', 'turnover', 'aging'] },
  { id: 'rep-4', title: 'Custom Reports', description: 'Building custom report layouts using the NovaPOS report designer.', module: 'Reporting', url: '/help/modules/reporting', tags: ['custom', 'report', 'designer', 'layout', 'export'] },

  // Commerce
  { id: 'com-1', title: 'E-Commerce Channels', description: 'Connecting and managing online storefronts with NovaPOS inventory sync.', module: 'Commerce', url: '/help/modules/commerce', tags: ['ecommerce', 'online', 'channel', 'store', 'sync'] },
  { id: 'com-2', title: 'Gift Cards', description: 'Issuing, activating, and redeeming gift cards across all channels.', module: 'Commerce', url: '/help/modules/commerce', tags: ['gift card', 'voucher', 'activate', 'redeem', 'balance'] },
  { id: 'com-3', title: 'Promotions & Discounts', description: 'Creating promotional price rules, coupons, and bundle discounts.', module: 'Commerce', url: '/help/modules/commerce', tags: ['promotion', 'discount', 'coupon', 'sale', 'bundle', 'price rule'] },

  // Shortcuts
  { id: 'sc-1', title: 'Keyboard Shortcuts Reference', description: 'Complete list of keyboard shortcuts for NovaPOS POS, navigation, and finance.', module: 'Reference', url: '/help/shortcuts', tags: ['keyboard', 'shortcut', 'hotkey', 'quick key', 'ctrl'] },

  // Training
  { id: 'tr-1', title: 'Admin Training Path', description: '8-module comprehensive training for system administrators.', module: 'Training', url: '/help/training/admin', tags: ['admin', 'training', 'setup', 'configuration', 'path'] },
  { id: 'tr-2', title: 'Manager Training Path', description: '6-module training covering daily operations and team management.', module: 'Training', url: '/help/training/manager', tags: ['manager', 'training', 'operations', 'staff', 'reports'] },
  { id: 'tr-3', title: 'Cashier Training Path', description: '4-module training for front-line POS operators.', module: 'Training', url: '/help/training/cashier', tags: ['cashier', 'training', 'pos', 'register', 'transaction'] },
  { id: 'tr-4', title: 'Accountant Training Path', description: '5-module training for finance and accounting staff.', module: 'Training', url: '/help/training/accountant', tags: ['accountant', 'training', 'finance', 'gl', 'period close'] },
]

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.toLowerCase().trim() ?? ''

  if (!q || q.length < 2) {
    return NextResponse.json({ articles: [], query: q })
  }

  const results = ARTICLES.filter(a => {
    return (
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.module.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    )
  })

  return NextResponse.json({ articles: results, query: q, total: results.length })
}
