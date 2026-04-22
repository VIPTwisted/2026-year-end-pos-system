export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ChevronRight, Keyboard } from 'lucide-react'

interface Shortcut {
  keys: string[]
  action: string
  notes?: string
}

interface Section {
  title: string
  shortcuts: Shortcut[]
}

const SECTIONS: Section[] = [
  {
    title: 'POS Terminal',
    shortcuts: [
      { keys: ['F1'], action: 'Open item search', notes: 'Focus the search bar at the top of the basket' },
      { keys: ['F2'], action: 'Attach / change customer', notes: 'Opens the customer lookup dialog' },
      { keys: ['F3'], action: 'Open discounts panel', notes: 'Apply transaction-level discount' },
      { keys: ['F4'], action: 'Suspend transaction', notes: 'Parks current basket to Suspended queue' },
      { keys: ['F5'], action: 'Recall transaction', notes: 'Opens suspended transaction picker' },
      { keys: ['F6'], action: 'Void current line', notes: 'Removes the selected item from the basket' },
      { keys: ['F7'], action: 'Void all (clear basket)', notes: 'Requires manager PIN if basket is non-empty' },
      { keys: ['F8'], action: 'No Sale (open drawer)', notes: 'Opens the cash drawer without a sale — logged in audit' },
      { keys: ['F9'], action: 'Price check', notes: 'Look up an item price without adding to basket' },
      { keys: ['F10'], action: 'Gift card balance inquiry', notes: 'Scan or enter gift card number to check balance' },
      { keys: ['F12'], action: 'Proceed to charge', notes: 'Opens payment panel — equivalent to clicking Charge' },
      { keys: ['Enter'], action: 'Confirm selected item / amount', notes: 'Context-sensitive confirm' },
      { keys: ['Esc'], action: 'Cancel current action', notes: 'Closes dialogs and payment panels' },
      { keys: ['Tab'], action: 'Move to next field', notes: 'Standard browser tab order throughout POS' },
      { keys: ['Ctrl', '+'], action: 'Increase quantity by 1', notes: 'For the currently selected basket line' },
      { keys: ['Ctrl', '-'], action: 'Decrease quantity by 1', notes: 'For the currently selected basket line' },
      { keys: ['Ctrl', 'R'], action: 'Start a return', notes: 'Opens the return/lookup dialog' },
      { keys: ['Ctrl', 'S'], action: 'Open shift (if closed)', notes: 'Opens the shift opening dialog' },
      { keys: ['Ctrl', 'W'], action: 'Close shift', notes: 'Begins reconciliation — requires all transactions complete' },
      { keys: ['Ctrl', 'P'], action: 'Reprint last receipt', notes: 'Reprints the most recently completed transaction receipt' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['Ctrl', 'K'], action: 'Global search', notes: 'Search any record — customers, products, orders, accounts' },
      { keys: ['Alt', '1'], action: 'Go to Dashboard' },
      { keys: ['Alt', '2'], action: 'Go to POS Terminal' },
      { keys: ['Alt', '3'], action: 'Go to Products / Inventory' },
      { keys: ['Alt', '4'], action: 'Go to Customers' },
      { keys: ['Alt', '5'], action: 'Go to Finance' },
      { keys: ['Alt', '6'], action: 'Go to Reports' },
      { keys: ['Alt', '7'], action: 'Go to Purchasing' },
      { keys: ['Alt', 'H'], action: 'Go to Help Center' },
      { keys: ['Alt', 'S'], action: 'Go to Settings' },
      { keys: ['Ctrl', 'N'], action: 'New record', notes: 'Creates a new record on the current module page' },
      { keys: ['Ctrl', 'E'], action: 'Edit current record', notes: 'Enters edit mode for the open record' },
      { keys: ['Ctrl', 'Z'], action: 'Undo last change', notes: 'Reverts unsaved field changes on a record form' },
      { keys: ['Ctrl', 'Shift', 'S'], action: 'Save current record', notes: 'Saves and stays on the current record' },
      { keys: ['F11'], action: 'Toggle fullscreen', notes: 'Maximizes the browser for POS kiosk mode' },
      { keys: ['Ctrl', 'B'], action: 'Toggle sidebar', notes: 'Collapses or expands the left navigation sidebar' },
      { keys: ['Ctrl', 'Left'], action: 'Previous record', notes: 'Navigate to the previous record in list order' },
      { keys: ['Ctrl', 'Right'], action: 'Next record', notes: 'Navigate to the next record in list order' },
    ],
  },
  {
    title: 'Finance & Accounting',
    shortcuts: [
      { keys: ['Ctrl', 'J'], action: 'New journal entry', notes: 'Opens blank journal entry form' },
      { keys: ['Ctrl', 'I'], action: 'New invoice', notes: 'Context-sensitive: AR or AP invoice based on current module' },
      { keys: ['Ctrl', 'M'], action: 'New credit memo', notes: 'Opens credit memo for current customer/vendor' },
      { keys: ['Ctrl', 'T'], action: 'View trial balance', notes: 'Opens the trial balance for the current fiscal period' },
      { keys: ['Ctrl', 'A'], action: 'Apply entries', notes: 'Opens the apply entries dialog for AR/AP matching' },
      { keys: ['F4'], action: 'Look up account', notes: 'Opens the account/dimension lookup on any account field' },
      { keys: ['F6'], action: 'Look up item', notes: 'Opens the item lookup on any item field' },
      { keys: ['F7'], action: 'Look up customer', notes: 'Opens the customer lookup on any customer field' },
      { keys: ['F8'], action: 'Look up vendor', notes: 'Opens the vendor lookup on any vendor field' },
      { keys: ['Ctrl', 'F7'], action: 'Customer statistics', notes: 'Shows AR aging and balance for the selected customer' },
      { keys: ['Ctrl', 'F8'], action: 'Vendor statistics', notes: 'Shows AP aging and balance for the selected vendor' },
      { keys: ['Ctrl', 'Shift', 'P'], action: 'Post current document', notes: 'Posts journal, invoice, or credit memo — cannot be undone' },
      { keys: ['Ctrl', 'Q'], action: 'Preview posting', notes: 'Shows GL entries that would result from posting without actually posting' },
    ],
  },
  {
    title: 'Reports',
    shortcuts: [
      { keys: ['Ctrl', 'Shift', 'R'], action: 'Open report builder', notes: 'Opens the custom report designer' },
      { keys: ['Ctrl', 'Shift', 'E'], action: 'Export current report', notes: 'Exports displayed report to CSV or PDF' },
      { keys: ['Ctrl', 'Shift', 'Print'], action: 'Print current report', notes: 'Sends the current report view to the printer' },
      { keys: ['Ctrl', 'Shift', 'F'], action: 'Filter / date range', notes: 'Opens the report filter dialog for date and dimension filters' },
      { keys: ['Ctrl', 'Shift', 'C'], action: 'Compare periods', notes: 'Adds a comparison column to the current report' },
      { keys: ['Ctrl', 'Shift', 'B'], action: 'Budget vs actual toggle', notes: 'Toggles budget comparison column on financial reports' },
      { keys: ['F5'], action: 'Refresh report data', notes: 'Re-queries the database with current filters' },
      { keys: ['Ctrl', 'Home'], action: 'Go to report start', notes: 'Scrolls report to the first row' },
      { keys: ['Ctrl', 'End'], action: 'Go to report end', notes: 'Scrolls report to the last row' },
    ],
  },
]

function KeyBadge({ label }: { label: string }) {
  return (
    <kbd className="inline-flex items-center justify-center px-2 py-0.5 min-w-[1.75rem] h-6 rounded border border-zinc-600 bg-zinc-800 text-zinc-300 font-mono text-xs leading-none shadow-sm">
      {label}
    </kbd>
  )
}

export default function ShortcutsPage() {
  return (
    <>
      <TopBar title="Keyboard Shortcuts" />
      <main className="flex-1 p-6 overflow-auto max-w-4xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
          <Link href="/help" className="hover:text-zinc-300 transition-colors">Help Center</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-400">Keyboard Shortcuts</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700">
              <Keyboard className="w-6 h-6 text-zinc-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">Keyboard Shortcuts Reference</h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                Speed up your workflow with NovaPOS keyboard shortcuts for POS, navigation, finance, and reporting.
              </p>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="mb-7 p-4 rounded-xl bg-blue-900/15 border border-blue-800/30">
          <p className="text-sm text-blue-200">
            <strong className="text-blue-100">Pro tip:</strong> On Mac, replace <KeyBadge label="Ctrl" /> with <KeyBadge label="⌘" /> for most shortcuts.
            Function keys (F1–F12) work the same on all platforms.
          </p>
        </div>

        {/* Shortcut Tables */}
        <div className="space-y-8">
          {SECTIONS.map(section => (
            <div key={section.title}>
              <h2 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full" />
                {section.title}
              </h2>
              <div className="rounded-xl border border-zinc-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-900 border-b border-zinc-800">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide w-48">Shortcut</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Action</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide hidden md:table-cell">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {section.shortcuts.map((sc) => (
                      <tr key={sc.keys.join('+')} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            {sc.keys.map((key, i) => (
                              <span key={key} className="flex items-center gap-1">
                                <KeyBadge label={key} />
                                {i < sc.keys.length - 1 && <span className="text-zinc-600 text-xs">+</span>}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-zinc-300 font-medium text-xs">{sc.action}</td>
                        <td className="px-4 py-2.5 text-zinc-500 text-xs hidden md:table-cell">{sc.notes ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

      </main>
    </>
  )
}
