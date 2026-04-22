export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ChevronRight, DollarSign, ShoppingCart, Package, Users,
  TrendingUp, Building2, GraduationCap, Factory, Globe, BarChart3,
  Info,
} from 'lucide-react'

interface Article {
  id: string
  title: string
  content: React.ReactNode
}

interface ModuleData {
  name: string
  icon: React.ElementType
  color: string
  iconBg: string
  desc: string
  articles: Article[]
}

const MODULES: Record<string, ModuleData> = {
  finance: {
    name: 'Finance',
    icon: DollarSign,
    color: 'text-emerald-400',
    iconBg: 'bg-emerald-600/10 border-emerald-600/20',
    desc: 'General ledger, accounts, journal entries, reconciliation, and period management.',
    articles: [
      {
        id: 'chart-of-accounts',
        title: 'Chart of Accounts',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">The chart of accounts (COA) is the foundation of your NovaPOS financial system. Every transaction that flows through POS, inventory, purchasing, and billing eventually posts to one or more GL accounts defined in your COA.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Account Number Structure</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">NovaPOS uses a five-digit account numbering system by default. The first digit indicates the account type: 1 = Assets, 2 = Liabilities, 3 = Equity, 4 = Revenue, 5–8 = Expenses, 9 = Statistical (memo accounts). Sub-accounts extend the parent with additional digits (e.g., 10100 = Cash — Main Checking under parent 10000 = Cash & Equivalents).</p>
            <h4 className="text-sm font-semibold text-zinc-100">Creating Accounts</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Finance → Chart of Accounts → New. Specify the account number, name, type, sub-type (e.g., Current Asset vs Fixed Asset), and whether it accepts direct posting. Summary/header accounts (marked "No Direct Posting") aggregate child balances for financial statements but cannot accept individual transactions.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Required Standard Accounts</h4>
            <ul className="space-y-1.5 text-sm text-zinc-400">
              {['10100 – Cash – Main Checking (links to bank reconciliation)', '10200 – Petty Cash (for float management)', '12000 – Accounts Receivable Control (never post directly)', '20100 – Accounts Payable Control (never post directly)', '30100 – Retained Earnings (auto-populated at year-end close)', '40100 – POS Sales Revenue', '50100 – Cost of Goods Sold'].map(a => (
                <li key={a} className="flex items-start gap-2"><span className="text-emerald-500 mt-1">·</span>{a}</li>
              ))}
            </ul>
            <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-800/30 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-200">Once a transaction is posted to an account, the account number cannot be changed. Plan your COA structure carefully before going live.</p>
            </div>
          </div>
        ),
      },
      {
        id: 'journal-entries',
        title: 'Journal Entries',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Journal entries allow manual adjustments and entries to the GL that are not generated automatically by transactions. Every journal entry must balance — total debits must equal total credits.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Types of Journals</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              {[
                ['General Journal', 'Manual entries for adjustments, reclassifications, and corrections.'],
                ['Recurring Journal', 'Template journals that post automatically on a defined schedule (e.g., monthly rent accrual).'],
                ['Accrual Journal', 'Journals with an automatic reversal on the first day of the following period.'],
                ['Allocation Journal', 'Distributes a single account balance across multiple cost centers by percentage.'],
              ].map(([name, desc]) => (
                <li key={name} className="flex items-start gap-2"><span className="text-zinc-200 font-medium w-36 shrink-0">{name}</span><span>{desc}</span></li>
              ))}
            </ul>
            <h4 className="text-sm font-semibold text-zinc-100">Creating a Journal Entry</h4>
            <ol className="space-y-2 text-sm text-zinc-400">
              {['Navigate to Finance → Journals → New and select the journal type.', 'Enter the journal date (must fall within an open period), a description, and your user reference.', 'Add debit lines: enter the account number and debit amount. Add credit lines: enter the account number and credit amount.', 'Verify the Difference field shows $0.00 — journals with a non-zero balance cannot be posted.', 'Click Post to commit the journal to the GL. Posted journals cannot be deleted — use a reversing journal to correct errors.'].map((s, i) => (
                <li key={i} className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 shrink-0 mt-0.5">{i + 1}</span>{s}</li>
              ))}
            </ol>
          </div>
        ),
      },
      {
        id: 'bank-reconciliation',
        title: 'Bank Reconciliation',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Bank reconciliation ensures that the balance in your NovaPOS bank account GL matches the balance on your bank statement, after accounting for deposits in transit and outstanding checks.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Reconciliation Workflow</h4>
            <ol className="space-y-2 text-sm text-zinc-400">
              {['Obtain your bank statement for the period you are reconciling.', 'Navigate to Bank Accounts → select the account → Reconcile → New Reconciliation.', 'Enter the statement closing date and the ending balance shown on your bank statement.', 'Import the statement file (OFX, CSV, MT940) or manually enter transactions.', 'Use Auto-Match to match statement lines to GL entries by amount and date.', 'Manually match remaining unmatched items.', 'Investigate any old outstanding items (checks older than 90 days, unposted deposits).', 'Post the reconciliation when the difference is $0.00.'].map((s, i) => (
                <li key={i} className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 shrink-0 mt-0.5">{i + 1}</span>{s}</li>
              ))}
            </ol>
            <h4 className="text-sm font-semibold text-zinc-100">Common Reconciling Items</h4>
            <ul className="space-y-1.5 text-sm text-zinc-400">
              {['Deposits in transit — posted in NovaPOS but not yet on the bank statement', 'Outstanding checks — issued and posted but not yet cleared by the bank', 'Bank charges — on the statement but not yet in NovaPOS (add a GL entry)', 'Interest earned — on the statement but not yet in NovaPOS (add a GL entry)'].map(a => (
                <li key={a} className="flex items-start gap-2"><span className="text-emerald-500 mt-1">·</span>{a}</li>
              ))}
            </ul>
          </div>
        ),
      },
      {
        id: 'period-close',
        title: 'Period Close Procedures',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Period close is the process of finalizing a fiscal month or year so that no further changes can be made. A disciplined close process ensures the accuracy of financial statements and audit readiness.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Month-End Checklist</h4>
            <ul className="space-y-1.5 text-sm text-zinc-400">
              {['Verify all POS shifts for the period are posted to GL', 'Confirm all purchase order receipts have matching vendor invoices', 'Post all bank deposits and confirm bank balances reconcile to statements', 'Create and post all accrual entries (wages, utilities, rent)', 'Run fixed asset depreciation for the period', 'Post any inventory adjustments from physical counts', 'Run and review the trial balance — total debits must equal total credits', 'Obtain management sign-off on the trial balance', 'Close the period in Settings → Fiscal Calendar'].map(a => (
                <li key={a} className="flex items-start gap-2"><span className="text-emerald-500 mt-1">·</span>{a}</li>
              ))}
            </ul>
            <h4 className="text-sm font-semibold text-zinc-100">Year-End Additional Steps</h4>
            <ul className="space-y-1.5 text-sm text-zinc-400">
              {['Run the Year-End Close Wizard under Finance → Year-End Close', 'The wizard transfers net income to Retained Earnings automatically', 'Create opening balances for the new fiscal year', 'Archive prior-year transactions for performance optimization', 'Print final versions of Balance Sheet, Income Statement, and Trial Balance as audit copies'].map(a => (
                <li key={a} className="flex items-start gap-2"><span className="text-zinc-500 mt-1">·</span>{a}</li>
              ))}
            </ul>
          </div>
        ),
      },
      {
        id: 'budgets',
        title: 'Budget Management',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">NovaPOS budgeting allows you to set revenue and expense targets by GL account and period. Actuals vs. budget variance reporting highlights over- and under-performance in real time.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Creating a Budget</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Budget → New Budget. Enter the budget name, fiscal year, and description. Choose entry method: enter amounts by period manually, copy from a prior year with a percentage uplift, or import via CSV. Budgets can be created at the store level or consolidated at company level.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Variance Reporting</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Reports → Financial → Budget vs Actual. Select the budget and date range. The report shows each GL account with the budgeted amount, actual posted amount, variance in dollars, and variance as a percentage. Favorable variances (revenue over budget, expense under budget) display in green; unfavorable in red.</p>
          </div>
        ),
      },
    ],
  },

  pos: {
    name: 'POS Terminal',
    icon: ShoppingCart,
    color: 'text-blue-400',
    iconBg: 'bg-blue-600/10 border-blue-600/20',
    desc: 'Point-of-sale terminal operations, payment processing, and shift management.',
    articles: [
      {
        id: 'pos-interface',
        title: 'POS Terminal Interface',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">The NovaPOS terminal is designed for speed and accuracy. The interface is split into three main zones: the transaction basket (left), the payment/action panel (right), and the control bar at the top.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Interface Zones</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              {[
                ['Transaction Basket', 'Displays all items in the current transaction with quantity, unit price, and line total. Scroll to see all items in large baskets.'],
                ['Item Search', 'Full-text search bar at the top of the basket. Supports barcode scan, SKU, and product name. Results populate instantly.'],
                ['Customer Panel', 'Below the search bar, shows the attached customer (name and loyalty point balance). Click to search or change the customer.'],
                ['Action Buttons', 'Right panel: Charge, Discount, Suspend, Void Line, Void All, Recall, No Sale. Only buttons permitted by your role are active.'],
                ['Status Bar', 'Shows shift status (open/closed), current time, register number, and cashier name.'],
              ].map(([name, desc]) => (
                <li key={name} className="flex items-start gap-2 py-1.5 border-b border-zinc-800 last:border-0"><span className="text-zinc-200 font-medium w-36 shrink-0">{name}</span><span>{desc}</span></li>
              ))}
            </ul>
          </div>
        ),
      },
      {
        id: 'shift-management',
        title: 'Shift Management',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Every POS transaction belongs to a shift. A shift tracks the cash float, all transactions processed, and who processed them. Shifts must be opened before transactions can be processed and closed with reconciliation at the end of the trading period.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Opening a Shift</h4>
            <ol className="space-y-1.5 text-sm text-zinc-400">
              {['Navigate to POS → Open Shift.', 'Count the physical cash in the drawer and enter the total opening float.', 'The expected float amount is shown — enter the counted amount.', 'Any variance is logged. Notify your manager if the variance is significant.', 'Click Confirm to open the shift and begin accepting transactions.'].map((s, i) => (
                <li key={i} className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 shrink-0">{i + 1}</span>{s}</li>
              ))}
            </ol>
            <h4 className="text-sm font-semibold text-zinc-100">Closing a Shift</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">At the end of the trading period, click Close Shift. Count cash by denomination. Enter each denomination count — the system totals automatically. The expected closing cash equals opening float + cash sales − cash refunds. Review the shift report and submit for manager approval. Once approved, the shift posts to GL.</p>
          </div>
        ),
      },
      {
        id: 'payment-types',
        title: 'Payment Types',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">NovaPOS supports multiple tender types in a single transaction (split tender). Each tender type posts to a specific GL account as configured by your administrator.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Supported Tender Types</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              {[
                ['Cash', 'Physical currency. The drawer opens after completing a cash tender. Change is calculated automatically.'],
                ['Credit / Debit Card', 'Integrates with card terminal. Supports chip, tap (NFC), and swipe. Auth and capture happen in one step for retail.'],
                ['Gift Card', 'Enter the gift card number or scan the barcode. The balance is verified in real time. Partial redemption leaves remaining balance on the card.'],
                ['Store Credit', 'Customer account credit issued from a previous return. Applied by selecting the customer — available credit displays automatically.'],
                ['Split Tender', 'Combine any two or more tenders. Add a partial amount for the first tender, then add additional tenders for the remaining balance.'],
              ].map(([name, desc]) => (
                <li key={name} className="flex items-start gap-2 py-1.5 border-b border-zinc-800 last:border-0"><span className="text-zinc-200 font-medium w-32 shrink-0">{name}</span><span>{desc}</span></li>
              ))}
            </ul>
          </div>
        ),
      },
      {
        id: 'returns-pos',
        title: 'Returns at POS',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Returns can be processed at any POS terminal. The return reverses the original sale in NovaPOS and adjusts inventory automatically.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Returning with a Receipt</h4>
            <ol className="space-y-1.5 text-sm text-zinc-400">
              {['Navigate to Orders and search by the 8-digit receipt number (e.g., RCP-00001234).', 'Open the transaction and click Return Items.', 'Select the items being returned and enter quantities.', 'Review the calculated refund amount.', 'Select refund method (same tender, store credit) and confirm.', 'A return receipt prints. The inventory is restocked automatically.'].map((s, i) => (
                <li key={i} className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 shrink-0">{i + 1}</span>{s}</li>
              ))}
            </ol>
            <h4 className="text-sm font-semibold text-zinc-100">Return Without Receipt</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">If the customer does not have a receipt, look up the transaction by customer name or payment card last four digits. If the transaction cannot be located, a manager can authorize a no-receipt return — select items manually, price at current selling price, and refund as store credit.</p>
          </div>
        ),
      },
      {
        id: 'suspend-recall',
        title: 'Suspend & Recall Transactions',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Suspend allows you to park a partially-built transaction and return to it later on the same or a different terminal, without losing the items in the basket.</p>
            <h4 className="text-sm font-semibold text-zinc-100">When to Use Suspend</h4>
            <ul className="space-y-1.5 text-sm text-zinc-400">
              {['A customer needs to get their wallet from the car', 'A customer wants to add more items but the line is backing up', 'Handing off a transaction to another cashier on a different terminal', 'Layaway-style holds where the customer returns later to pay'].map(a => <li key={a} className="flex items-start gap-2"><span className="text-blue-400 mt-1">·</span>{a}</li>)}
            </ul>
            <h4 className="text-sm font-semibold text-zinc-100">How to Suspend</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Click Suspend in the action panel. Enter an optional customer name or note for the suspended transaction. The basket clears and the transaction moves to the Suspended Transactions queue. A suspended transaction ID (e.g., SUS-042) is shown on screen.</p>
            <h4 className="text-sm font-semibold text-zinc-100">How to Recall</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Click Recall in the action panel. Select the suspended transaction from the list, or search by the suspended transaction ID. The basket repopulates with all suspended items. You can add more items or proceed directly to payment.</p>
          </div>
        ),
      },
    ],
  },

  inventory: {
    name: 'Inventory',
    icon: Package,
    color: 'text-violet-400',
    iconBg: 'bg-violet-600/10 border-violet-600/20',
    desc: 'Item management, stock counts, transfers, and automated replenishment.',
    articles: [
      {
        id: 'item-cards',
        title: 'Item Cards',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Every product in NovaPOS is represented by an item card. The item card stores all product information including cost, pricing, unit of measure, tax category, and inventory tracking settings.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Creating an Item Card</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Products → New. Enter the item number (auto-generated or manual), description, item category, unit of measure, and base unit of measure (smallest unit sold). Set the costing method — FIFO is standard for retail, Average Cost for food service. Enable inventory tracking to count and reorder this item.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Pricing Setup</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Under the item card Prices tab, enter the Unit Cost (what you paid), and one or more Selling Prices. You can have different prices for different customer groups (retail, wholesale, VIP). Prices can be scheduled with start and end dates for temporary promotions.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Barcode and SKU</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Add barcodes under the item card → Barcodes tab. NovaPOS supports EAN-13, UPC-A, UPC-E, Code 128, and QR codes. An item can have multiple barcodes (e.g., different package sizes). The SKU field is your internal identifier — it must be unique across all items.</p>
          </div>
        ),
      },
      {
        id: 'stock-counts',
        title: 'Physical Stock Counts',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Physical inventory counts verify that the system quantities match the actual quantities on the shelf. NovaPOS supports full counts, partial counts, and cycle counts.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Count Process</h4>
            <ol className="space-y-1.5 text-sm text-zinc-400">
              {['Navigate to Inventory → Count Schedules → New Count.', 'Select count type: Full (all items), Zone (specific shelf/area), or Category.', 'Set the count date and assign counters. Freeze inventory posting during the count (optional but recommended).', 'Counters record actual quantities via scanner, tablet, or paper count sheet.', 'Enter actual quantities into the count worksheet. NovaPOS calculates the variance vs system quantity.', 'Review variances. Items with large discrepancies should be physically re-counted before posting.', 'Post the count — adjustments post to the Inventory Adjustment GL account automatically.'].map((s, i) => <li key={i} className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 shrink-0">{i + 1}</span>{s}</li>)}
            </ol>
          </div>
        ),
      },
      {
        id: 'transfers',
        title: 'Inventory Transfers',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Transfer orders move stock between warehouse locations, stores, or virtual locations within NovaPOS. Each transfer creates corresponding GL entries reducing inventory at the source and increasing it at the destination.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Creating a Transfer</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Inventory → Transfers → New. Select the From Location (source) and To Location (destination). Add items and quantities. Set the expected shipment and receipt dates. Release the transfer — this generates the shipment document for the warehouse team.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Shipping and Receiving</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">At the source location, verify items against the transfer, then post the shipment. Inventory reduces at the source immediately. At the destination, receive the transfer by scanning or manually confirming received quantities. Inventory increases at the destination when the receipt is posted. Partial receipts are supported — the transfer stays open for remaining quantities.</p>
          </div>
        ),
      },
      {
        id: 'purchase-orders-inv',
        title: 'Purchase Orders',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Purchase orders (POs) are formal requests to vendors to supply specific items at agreed quantities and prices. NovaPOS tracks POs from creation through receipt and vendor invoice matching.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Creating a Purchase Order</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Purchasing → New Purchase Order. Select the vendor. Add line items with quantity and agreed unit cost. Set the expected receipt date. NovaPOS auto-populates vendor costs from the item card if previously configured. Submit the PO for manager approval, then release to the vendor (email or print).</p>
            <h4 className="text-sm font-semibold text-zinc-100">Receiving Against a PO</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">When goods arrive, navigate to the PO and click Receive. Scan or enter received quantities. For partial receipts, enter only the quantity received — the PO remains open for outstanding lines. Post the receipt to update inventory. The received quantity locks the cost for the matched vendor invoice.</p>
          </div>
        ),
      },
      {
        id: 'reorder-points',
        title: 'Reorder Points & Auto-Replenishment',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Reorder points trigger automatic purchase order suggestions when item stock falls below the defined minimum. This prevents stockouts without requiring manual monitoring of every item.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Setting Reorder Points</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">On the item card → Replenishment tab, enter the Reorder Point (quantity below which a PO should be suggested), Reorder Quantity (quantity to order when triggered), and Preferred Vendor. NovaPOS monitors inventory continuously and raises a replenishment alert when any item crosses its reorder point.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Processing Replenishment Suggestions</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Purchasing → Replenishment Suggestions. Review the list of triggered items sorted by urgency (lowest days-of-stock-remaining first). Adjust quantities if needed, then bulk-convert selected suggestions to purchase orders. NovaPOS groups suggestions by vendor to minimize PO count.</p>
          </div>
        ),
      },
    ],
  },

  customers: {
    name: 'Customers',
    icon: Users,
    color: 'text-cyan-400',
    iconBg: 'bg-cyan-600/10 border-cyan-600/20',
    desc: 'Customer accounts, loyalty, invoicing, and credit management.',
    articles: [
      {
        id: 'customer-card',
        title: 'Customer Card',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">The customer card is the central record for each customer account in NovaPOS. It stores contact information, pricing assignments, credit settings, and a complete transaction history.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Customer Card Tabs</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              {[['General', 'Name, email, phone, address, customer number, and account creation date.'], ['Billing', 'Payment terms, credit limit, credit hold status, and AR account assignment.'], ['Sales', 'Salesperson assignment, price group, discount group, and currency.'], ['Loyalty', 'Loyalty tier, total points, points earning rate, and redemption history.'], ['History', 'Complete purchase history: all transactions, invoices, and returns.'], ['Notes', 'Internal notes visible to all staff — service history and preferences.']].map(([tab, desc]) => <li key={tab} className="flex items-start gap-2 py-1.5 border-b border-zinc-800 last:border-0"><span className="text-zinc-200 font-medium w-20 shrink-0">{tab}</span><span>{desc}</span></li>)}
            </ul>
          </div>
        ),
      },
      {
        id: 'loyalty',
        title: 'Loyalty Program',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">NovaPOS includes a built-in loyalty points system. Customers earn points on qualifying purchases and redeem them for discounts on future transactions.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Program Configuration</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Configure under Settings → Loyalty Program. Set the earn rate (e.g., 1 point per $1.00 spent), the redemption rate (e.g., 100 points = $1.00 discount), and the minimum points required for redemption. Exclude specific items or categories from earning points (e.g., gift cards, tobacco).</p>
            <h4 className="text-sm font-semibold text-zinc-100">Loyalty Tiers</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Create tiers (Bronze, Silver, Gold, Platinum) with spending thresholds and bonus earning rates. A Gold customer earns 1.5× points on all purchases. Tiers are evaluated at the start of each calendar year based on prior-year total spend. Tier assignments can also be set manually by managers.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Redeeming Points at POS</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Attach the customer to the transaction. If they have redeemable points, a Redeem Points button appears in the payment panel. The cashier or customer selects the number of points to redeem — the discount is applied to the transaction total. Remaining points stay on the account.</p>
          </div>
        ),
      },
      {
        id: 'ar-invoices',
        title: 'AR Invoices & Collections',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">For customers with account terms, NovaPOS generates AR invoices instead of requiring immediate payment. The AR module tracks open balances, due dates, and collections activity.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Creating an AR Invoice</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to AR → New Invoice. Select the customer, invoice date, and due date (auto-calculated from payment terms). Add line items (products or services). Post the invoice to increase the customer's open AR balance. The invoice can be emailed directly from NovaPOS with a Pay Now link if your payment gateway supports it.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Collections Management</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Reports → AR → Aging to view balances by aging bucket. For overdue accounts, use the Send Statement function to email a statement of account. Place a customer on Credit Hold (customer card → Billing tab) to prevent new orders until the balance is cleared. Document all collection calls in the customer card Notes.</p>
          </div>
        ),
      },
      {
        id: 'customer-orders',
        title: 'Customer Orders',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Customer orders track special orders, backorders, and orders that require pick, pack, and ship fulfillment rather than immediate POS pickup.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Creating a Customer Order</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Orders → New Customer Order. Select the customer and shipping address. Add items. If inventory is available, the order can be fulfilled from stock. If the item is out of stock, it is backordered — NovaPOS reserves the quantity when it arrives from the next purchase order receipt.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Order Fulfillment</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Orders in the fulfillment queue appear in Inventory → Pick Orders. Warehouse staff pick the items and record the picked quantities. After picking, the shipment is created and posted. The posting reduces inventory and creates the AR invoice (or marks the POS transaction as paid if pre-paid). A shipment notification is emailed to the customer.</p>
          </div>
        ),
      },
    ],
  },

  sales: {
    name: 'Sales',
    icon: TrendingUp,
    color: 'text-amber-400',
    iconBg: 'bg-amber-600/10 border-amber-600/20',
    desc: 'Quotes, orders, invoices, returns, and credit memo processing.',
    articles: [
      {
        id: 'sales-quotes',
        title: 'Sales Quotes',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Sales quotes are non-binding estimates sent to prospective customers before an order is confirmed. NovaPOS tracks quote status and converts accepted quotes to sales orders in one click.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Creating a Quote</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Sales → Quotes → New. Select the customer or enter a prospect name and contact info. Add line items with quantities and prices — quotes can use customer-specific price lists or one-off negotiated prices. Set the quote expiry date. Generate a PDF and email directly from NovaPOS.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Quote to Order Conversion</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">When the customer accepts, open the quote and click Make Order. All lines, pricing, and customer details transfer to a new sales order automatically. The quote status changes to Converted. Quote history is retained and linked to the resulting order for reference.</p>
          </div>
        ),
      },
      {
        id: 'sales-orders',
        title: 'Sales Orders',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Sales orders are confirmed commitments from customers to purchase specific items at agreed quantities and prices. NovaPOS manages the full lifecycle from order entry through shipment and invoicing.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Order Status Flow</h4>
            <ul className="space-y-1.5 text-sm text-zinc-400">
              {[['Open', 'Order entered, not yet picked or shipped.'], ['Partially Shipped', 'Some lines shipped; remaining lines are on backorder.'], ['Shipped', 'All lines shipped; awaiting invoice.'], ['Invoiced', 'Invoice posted; awaiting payment.'], ['Closed', 'Paid and archived.']].map(([s, d]) => <li key={s} className="flex items-start gap-2"><span className="text-amber-400 font-medium w-28 shrink-0">{s}</span><span>{d}</span></li>)}
            </ul>
            <h4 className="text-sm font-semibold text-zinc-100">Reservations</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">When you release a sales order, NovaPOS reserves the ordered quantity in inventory. Reserved stock cannot be sold at POS or allocated to other orders. If stock is insufficient, the unfulfilable quantity is backordered. Backorders are filled automatically when inventory arrives from a purchase order receipt.</p>
          </div>
        ),
      },
      {
        id: 'sales-invoices',
        title: 'Sales Invoices',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Sales invoices are posted when goods are shipped or when billing occurs for services. Posting a sales invoice creates the AR entry and reduces inventory (if item-based).</p>
            <h4 className="text-sm font-semibold text-zinc-100">Invoice from Shipment</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">After posting a shipment, open the sales order and click Invoice. NovaPOS pre-fills the invoice from the shipment quantity. Review the invoice date and due date (calculated from payment terms) then post. The AR balance increases and inventory is already reduced (at shipment posting).</p>
            <h4 className="text-sm font-semibold text-zinc-100">Direct Invoice (without Order)</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">For service billing or one-off invoices, navigate to Sales → Invoices → New. Select the customer, add GL account lines (for services) or item lines (for goods). Posting a direct invoice reduces inventory and posts AR in a single step.</p>
          </div>
        ),
      },
      {
        id: 'credit-memos',
        title: 'Returns & Credit Memos',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Credit memos reverse posted sales invoices and return items to inventory. They reduce the customer's AR balance and can be applied to outstanding invoices or refunded as cash.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Creating a Credit Memo</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Sales → Credit Memos → New, or open the original invoice and click Create Credit Memo. NovaPOS copies all lines from the invoice. Remove or adjust lines for partial returns. Set the return date. If items are being physically returned to stock, enable "Return to Inventory" — NovaPOS increases inventory on posting.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Applying Credit Memos</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">After posting, the credit memo reduces the customer's open AR balance. Navigate to AR → Apply Entries to match the credit memo against a specific outstanding invoice, or leave it as an open credit that applies to the next invoice. Cash refunds are processed via AR → Refund.</p>
          </div>
        ),
      },
    ],
  },

  purchasing: {
    name: 'Purchasing',
    icon: Building2,
    color: 'text-orange-400',
    iconBg: 'bg-orange-600/10 border-orange-600/20',
    desc: 'Vendor management, purchase orders, receiving, and AP payment processing.',
    articles: [
      {
        id: 'vendor-management',
        title: 'Vendor Management',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Vendor cards store all supplier information including contact details, payment terms, bank account for payments, and a complete purchase history.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Creating a Vendor Card</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Vendors / AP → New Vendor. Enter the vendor name, legal name (for remittance), address, primary contact, phone, and email. Set payment terms (Net 30, 2/10 Net 30, etc.) and the default currency. Assign the vendor to a vendor posting group which maps their AP transactions to the correct GL accounts.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Vendor Bank Account for Payments</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Under the vendor card → Payment tab, add the vendor's bank account details (routing number and account number) for ACH payments, or SWIFT/IBAN for international wire payments. This information is used when generating payment files for your bank.</p>
          </div>
        ),
      },
      {
        id: 'po-workflow',
        title: 'Purchase Order Workflow',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Purchase orders follow an approval workflow before being released to vendors. The workflow ensures spend control and prevents unauthorized purchasing.</p>
            <h4 className="text-sm font-semibold text-zinc-100">PO Approval Thresholds</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Configure approval thresholds under Settings → Approvals. POs under $500 may be auto-approved for authorized purchasers. POs $500–$5,000 require manager approval. POs over $5,000 require admin approval. These thresholds are configurable per user group.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Releasing a PO</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Once approved, click Release on the PO. NovaPOS changes the status to Released and optionally emails the PO PDF to the vendor's email address on file. A released PO can still be partially modified (quantity reductions only) before receiving begins.</p>
          </div>
        ),
      },
      {
        id: 'receiving',
        title: 'Receiving Goods',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">When vendor shipments arrive, record the receipt against the open PO. This updates inventory and creates the obligation to pay the vendor invoice.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Posting a Receipt</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to the PO and click Receive. Enter received quantities — NovaPOS suggests the full PO quantity; adjust down for partial deliveries. Scan barcodes for accuracy. Inspect for damage and note any discrepancies in the receipt notes. Post the receipt to increase inventory immediately. The PO status changes to Partially Received or Fully Received.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Over and Under Receipt</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">If the vendor ships more than ordered (over-receipt), NovaPOS warns before allowing the additional quantity. Over-receipts above 5% require manager authorization. Under-receipts leave the remaining quantity open on the PO for the next delivery.</p>
          </div>
        ),
      },
      {
        id: 'ap-invoices',
        title: 'AP Invoices & Payment Runs',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">AP invoices are matched to purchase order receipts using three-way matching (PO → Receipt → Invoice) to prevent payment errors and fraud.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Three-Way Match</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">When you create an AP invoice, click Get PO Lines to auto-populate from the receipt. NovaPOS compares the invoice quantity to the received quantity and the invoice cost to the PO cost. Discrepancies outside your tolerance (e.g., ±2%) are flagged for review before the invoice can be approved.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Running a Payment Batch</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to AP → Payment Runs → New. Set the payment date (typically today or the payment cycle date). Set the pay-through date (pay all invoices due by this date). Review the suggested invoices — deselect any to hold for another cycle. Select the payment method (check, ACH, wire) and post. NovaPOS marks invoices as paid, creates bank entries, and generates the payment file for upload to your bank.</p>
          </div>
        ),
      },
    ],
  },

  hr: {
    name: 'HR & Payroll',
    icon: GraduationCap,
    color: 'text-pink-400',
    iconBg: 'bg-pink-600/10 border-pink-600/20',
    desc: 'Employee records, time clock, payroll, and department management.',
    articles: [
      {
        id: 'employee-records',
        title: 'Employee Records',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Every employee in NovaPOS has a record that links their HR profile, NovaPOS user account, payroll settings, and time clock data in one place.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Creating an Employee Record</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to HR → Employees → New. Enter legal name, employee ID, hire date, job title, department, and store assignment. Link to the NovaPOS user account (if the employee also logs into NovaPOS). Set employment type (full-time, part-time, contract) and pay type (hourly or salary).</p>
            <h4 className="text-sm font-semibold text-zinc-100">Pay Rate and Deductions</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Under the employee record → Payroll tab, enter the hourly rate or annual salary. Configure statutory deductions (federal tax, state tax, Social Security, Medicare) and voluntary deductions (health insurance, 401k). Deductions can be flat amounts or percentages of gross pay, applied before or after tax.</p>
          </div>
        ),
      },
      {
        id: 'time-clock',
        title: 'Time Clock & Attendance',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">The NovaPOS time clock records employee arrivals, departures, and breaks. Time records feed directly into payroll calculations.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Clocking In and Out</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">At the POS terminal or a dedicated time clock kiosk, employees enter their employee ID or scan their badge to clock in. The system records the timestamp. Breaks are tracked separately — the employee clicks Start Break and End Break. Clocking out records the end timestamp and calculates the total hours for the shift.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Reviewing and Correcting Records</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Managers review time records under HR → Time Clock → Records. Missed clock-outs (employee forgot) appear as open records. Edit the record, enter the correct out time with a reason note. All edits are stamped with the manager's user ID and require a PIN confirmation. Employees can view their own records but cannot edit them.</p>
          </div>
        ),
      },
      {
        id: 'payroll',
        title: 'Payroll Processing',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">NovaPOS calculates gross pay from time records, applies configured deductions, and generates payroll journal entries. It does not process bank transfers directly — export the payroll file for your payroll provider.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Running Payroll</h4>
            <ol className="space-y-1.5 text-sm text-zinc-400">
              {['Navigate to HR → Payroll → New Payroll Run.', 'Select the pay period (weekly, bi-weekly, or semi-monthly).', 'NovaPOS imports all approved time records for the period.', 'Review gross pay, overtime (hours over 40/week at 1.5× rate), deductions, and net pay for each employee.', 'Correct any discrepancies — add bonus or commission adjustments if applicable.', 'Approve the payroll run. NovaPOS posts the payroll journal entry: Wages Expense DR, Payroll Liability CR, Deductions Payable CR.', 'Export the payroll file (CSV or direct integration) for your payroll provider to process ACH direct deposits.'].map((s, i) => <li key={i} className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 shrink-0">{i + 1}</span>{s}</li>)}
            </ol>
          </div>
        ),
      },
    ],
  },

  manufacturing: {
    name: 'Manufacturing',
    icon: Factory,
    color: 'text-yellow-400',
    iconBg: 'bg-yellow-600/10 border-yellow-600/20',
    desc: 'BOMs, production orders, work centers, and capacity planning.',
    articles: [
      {
        id: 'boms',
        title: 'Bills of Materials',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">A Bill of Materials (BOM) defines the components and quantities required to produce one unit of a finished good. BOMs drive material requirements planning and production costing in NovaPOS Manufacturing.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Creating a BOM</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Manufacturing → Bills of Materials → New. Select the parent item (finished good). Add component lines: for each component, specify the item number, quantity per unit, unit of measure, and whether it is a raw material, sub-assembly, or by-product. Certify the BOM when it is ready for production use — only certified BOMs can be used on production orders.</p>
            <h4 className="text-sm font-semibold text-zinc-100">BOM Versioning</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">NovaPOS maintains BOM version history. When you need to change a component (e.g., substitute a material due to supplier change), create a new BOM version with an effective date. Production orders automatically use the active version effective at the scheduled start date. Historical production orders retain their original BOM version for costing accuracy.</p>
          </div>
        ),
      },
      {
        id: 'production-orders',
        title: 'Production Orders',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Production orders authorize the manufacture of a specified quantity of a finished good. NovaPOS tracks the order from planned through released to finished, updating inventory and costs at each stage.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Production Order Lifecycle</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              {[['Simulated', 'Planning stage — calculates material needs without reserving inventory.'], ['Planned', 'Material requirements confirmed; inventory reserved but not consumed.'], ['Firm Planned', 'Scheduled on work center capacity; production team notified.'], ['Released', 'Active production in progress; materials are being consumed.'], ['Finished', 'Production complete; output posted to finished goods inventory.']].map(([s, d]) => <li key={s} className="flex items-start gap-2"><span className="text-yellow-400 font-medium w-28 shrink-0">{s}</span><span>{d}</span></li>)}
            </ul>
            <h4 className="text-sm font-semibold text-zinc-100">Posting Output</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">When production is complete, post the output under the production order → Output Journal. Enter the quantity finished and scrap quantity. NovaPOS calculates the total cost (materials consumed + labor routed) and posts the finished goods to inventory at that calculated cost.</p>
          </div>
        ),
      },
      {
        id: 'work-centers',
        title: 'Work Centers & Capacity',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Work centers represent production resources — machines, assembly stations, or work crews. Capacity planning in NovaPOS ensures production orders are scheduled within available work center hours.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Defining Work Centers</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Manufacturing → Work Centers → New. Enter the work center name, capacity (hours available per day), efficiency factor (e.g., 85% to account for changeover and breaks), and cost per hour. Link work centers to machine centers for more granular capacity tracking.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Capacity Planning</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Manufacturing → Capacity Planning → Load Graph. Select a date range and work center. The graph shows scheduled load (hours from released production orders) vs available capacity. Red bars indicate overload. Adjust production order scheduled dates or increase work center shifts to resolve overload before orders fall behind.</p>
          </div>
        ),
      },
    ],
  },

  commerce: {
    name: 'Commerce',
    icon: Globe,
    color: 'text-indigo-400',
    iconBg: 'bg-indigo-600/10 border-indigo-600/20',
    desc: 'E-commerce channels, gift cards, promotions, and shipping.',
    articles: [
      {
        id: 'ecommerce-channels',
        title: 'E-Commerce Channels',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">NovaPOS Commerce connects your physical store inventory to online storefronts. Inventory levels sync bidirectionally so online orders are never fulfilled from stock that is already sold in-store.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Adding a Channel</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Settings → Commerce Channels → New Channel. Select the channel type (NovaPOS Webstore, or a third-party connector). Enter the API credentials for the external platform. Map the channel to a NovaPOS store location — online orders from this channel will pull inventory from the assigned location.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Product Publishing</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Publishing an item to a channel creates the product listing on the online store with the price, description, and images from the NovaPOS item card. Price changes and stock levels sync automatically every 15 minutes. Pulling an item from a channel unpublishes it immediately without deleting the channel configuration.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Order Import</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Online orders import into NovaPOS as customer orders every 5 minutes. They appear in the Orders queue with a Channel badge indicating their source. Fulfillment, shipping, and invoicing follow the same workflow as in-store customer orders. Shipping updates and tracking numbers are pushed back to the channel automatically.</p>
          </div>
        ),
      },
      {
        id: 'gift-cards',
        title: 'Gift Cards',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">NovaPOS manages the full gift card lifecycle: issuance, activation, balance inquiry, redemption, and re-load. Gift card balances are tracked as a liability (Gift Card Liability account) until redeemed.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Issuing a Gift Card at POS</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">At the POS, add the Gift Card item to the basket. When the amount is confirmed, the cashier scans the physical gift card to activate it. The amount is charged as a normal sale and posted as a credit to the Gift Card Liability account. The physical card is handed to the customer.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Checking a Balance</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">At the POS or at Commerce → Gift Cards, scan or enter the card number to see the current balance, issue date, and transaction history. Balances can also be checked on the NovaPOS customer portal if enabled.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Redemption</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">At the payment screen, select Gift Card as the tender. Scan the card. NovaPOS verifies the balance and applies the available amount to the transaction. If the balance is insufficient, the remaining amount can be paid with another tender (split tender). After redemption, the liability account is debited to record the revenue recognition.</p>
          </div>
        ),
      },
      {
        id: 'promotions-commerce',
        title: 'Promotions & Discounts',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">NovaPOS promotions apply automatically at POS and on the online channel when conditions are met — no manual cashier action required.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Promotion Types</h4>
            <ul className="space-y-1.5 text-sm text-zinc-400">
              {[['Percentage Discount', 'X% off the item price or the entire transaction.'], ['Fixed Amount Off', '$X off when a minimum order value is reached.'], ['Buy X Get Y', 'Buy 2, get the 3rd at 50% off or free.'], ['Bundle Pricing', 'Buy all items in a bundle and receive a special bundle price.'], ['Customer Group Pricing', 'Special prices automatically applied for assigned customer groups.']].map(([t, d]) => <li key={t} className="flex items-start gap-2"><span className="text-indigo-400 font-medium w-40 shrink-0">{t}</span><span>{d}</span></li>)}
            </ul>
            <h4 className="text-sm font-semibold text-zinc-100">Promotion Priority</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">When multiple promotions could apply to the same item, NovaPOS uses the priority number to determine which promotion wins. Lower priority numbers win first. Configure whether promotions can stack (allow multiple discounts on one item) or whether only the highest-priority promotion applies.</p>
          </div>
        ),
      },
    ],
  },

  reporting: {
    name: 'Reporting',
    icon: BarChart3,
    color: 'text-teal-400',
    iconBg: 'bg-teal-600/10 border-teal-600/20',
    desc: 'Financial statements, sales analytics, inventory reports, and custom report builder.',
    articles: [
      {
        id: 'financial-reports',
        title: 'Financial Reports',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">NovaPOS generates the three core financial statements — Income Statement, Balance Sheet, and Cash Flow Statement — directly from posted GL transactions.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Income Statement</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Reports → Financial → Income Statement. Select the period (month, quarter, YTD, or custom date range). The report shows Net Revenue, Cost of Goods Sold, Gross Profit, Operating Expenses by category, Operating Income, Other Income/Expense, and Net Income. A comparative column shows the same period prior year.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Balance Sheet</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Reports → Financial → Balance Sheet. As of any posted date, view Current Assets (cash, AR, inventory), Fixed Assets (net of depreciation), Current Liabilities (AP, accrued expenses), Long-term Liabilities, and Equity (paid-in capital, retained earnings). Assets always equal Liabilities + Equity.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Cash Flow Statement</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Reports → Financial → Cash Flow. Three sections: Operating Activities (cash generated by normal business operations), Investing Activities (capex, asset sales), Financing Activities (loan proceeds, repayments, equity). Net change in cash reconciles the beginning and ending cash balance on the Balance Sheet.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Trial Balance</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Navigate to Reports → Financial → Trial Balance. Lists every GL account with its debit or credit balance for the selected period. The sum of all debit balances must equal the sum of all credit balances. Run this before every period close as the primary data integrity check.</p>
          </div>
        ),
      },
      {
        id: 'sales-analytics',
        title: 'Sales Analytics',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">The sales analytics suite provides real-time and historical views of store performance, product trends, and customer behavior.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Key Sales Reports</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              {[
                ['Daily Sales Summary', 'Gross sales, discounts, net sales, transaction count, and average transaction value.'],
                ['Sales by Product', 'Units sold, revenue, cost, and margin by item — sortable by any metric.'],
                ['Sales by Category', 'Revenue and margin roll-up by product category.'],
                ['Sales by Cashier', 'Performance comparison across staff members.'],
                ['Hourly Traffic', 'Transaction volume by hour of day to guide staffing decisions.'],
                ['Year-over-Year', 'Current period vs same period last year with variance %.'],
              ].map(([r, d]) => <li key={r} className="flex items-start gap-2 py-1.5 border-b border-zinc-800 last:border-0"><span className="text-teal-400 font-medium w-36 shrink-0">{r}</span><span>{d}</span></li>)}
            </ul>
          </div>
        ),
      },
      {
        id: 'inventory-reports',
        title: 'Inventory Reports',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">Inventory reports provide visibility into stock values, movement velocity, and aging to support purchasing and merchandising decisions.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Key Inventory Reports</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              {[
                ['Stock Valuation', 'Current quantity on hand × cost for each item. Total value equals the Inventory GL balance.'],
                ['Inventory Turnover', 'COGS ÷ average inventory. Higher turnover = better capital efficiency.'],
                ['Slow Movers', 'Items with zero or low sales in the last 90 days — candidates for markdown or return to vendor.'],
                ['Stock Aging', 'Inventory broken down by how long it has been on hand — highlights risk of obsolescence.'],
                ['Movement Report', 'All stock in/out movements for selected items and periods with source document references.'],
              ].map(([r, d]) => <li key={r} className="flex items-start gap-2 py-1.5 border-b border-zinc-800 last:border-0"><span className="text-teal-400 font-medium w-36 shrink-0">{r}</span><span>{d}</span></li>)}
            </ul>
          </div>
        ),
      },
      {
        id: 'custom-reports',
        title: 'Custom Reports',
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">The NovaPOS report designer allows you to build custom reports from any data in the system — GL balances, transactions, customers, inventory — with full control over columns, grouping, sorting, and calculations.</p>
            <h4 className="text-sm font-semibold text-zinc-100">Building a Custom Report</h4>
            <ol className="space-y-1.5 text-sm text-zinc-400">
              {['Navigate to Reports → Custom Reports → New Report.', 'Select the primary data source (Transactions, GL Entries, Inventory, Customers, etc.).', 'Drag and drop fields from the field list to the report columns area.', 'Add grouping: drag fields to the Group By area to subtotal by store, category, period, etc.', 'Add calculated fields: click Add Calculated Field to create formulas (e.g., Gross Margin % = (Revenue − Cost) ÷ Revenue).', 'Set default sort and any filters (e.g., only show items in a specific category).', 'Click Save and name the report. It appears in your report library.', 'Schedule automated delivery if needed via Reports → Scheduled Reports.'].map((s, i) => <li key={i} className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 shrink-0">{i + 1}</span>{s}</li>)}
            </ol>
          </div>
        ),
      },
    ],
  },
}

export default async function ModuleHelpPage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params
  const data = MODULES[module]

  if (!data) notFound()

  return (
    <>
      <TopBar title={`${data.name} Guide`} />
      <main className="flex-1 overflow-auto">
        <div className="flex min-h-full">

          {/* Sidebar */}
          <aside className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-950 sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto py-5 px-3">
            <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide px-2 mb-3">Articles</div>
            <nav className="space-y-0.5">
              {data.articles.map(a => (
                <a
                  key={a.id}
                  href={`#${a.id}`}
                  className="block px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  {a.title}
                </a>
              ))}
            </nav>
            <div className="mt-6 pt-4 border-t border-zinc-800">
              <Link href="/help/modules" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2">
                <ChevronRight className="w-3 h-3 rotate-180" /> All Modules
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 p-6 max-w-3xl">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
              <Link href="/help" className="hover:text-zinc-300 transition-colors">Help Center</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/help/modules" className="hover:text-zinc-300 transition-colors">Module Guides</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-zinc-400">{data.name}</span>
            </nav>

            {/* Hero */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${data.iconBg}`}>
                  <data.icon className={`w-5 h-5 ${data.color}`} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-zinc-100">{data.name} Module</h1>
                  <p className="text-sm text-zinc-500 mt-0.5">{data.desc}</p>
                </div>
              </div>
            </div>

            {/* Articles */}
            <div className="space-y-10">
              {data.articles.map(article => (
                <article key={article.id} id={article.id} className="scroll-mt-20">
                  <h2 className="text-base font-semibold text-zinc-100 mb-4 pb-3 border-b border-zinc-800">{article.title}</h2>
                  {article.content}
                </article>
              ))}
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
