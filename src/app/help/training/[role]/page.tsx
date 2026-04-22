export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Settings, Zap, ShoppingCart, DollarSign } from 'lucide-react'
import { TrainingClient } from '../TrainingClient'

const ROLE_META: Record<string, { label: string; icon: React.ElementType; color: string; iconBg: string }> = {
  admin: { label: 'Administrator', icon: Settings, color: 'text-blue-400', iconBg: 'bg-blue-600/15 border-blue-600/25' },
  manager: { label: 'Store Manager', icon: Zap, color: 'text-violet-400', iconBg: 'bg-violet-600/15 border-violet-600/25' },
  cashier: { label: 'Cashier', icon: ShoppingCart, color: 'text-emerald-400', iconBg: 'bg-emerald-600/15 border-emerald-600/25' },
  accountant: { label: 'Accountant', icon: DollarSign, color: 'text-amber-400', iconBg: 'bg-amber-600/15 border-amber-600/25' },
}

const MODULES: Record<string, Array<{ id: string; name: string; time: string; objective: string; steps: Array<{ heading: string; body: string; tips?: string[] }> }>> = {
  admin: [
    {
      id: 'admin-1', name: 'Platform Setup', time: '35 min',
      objective: 'Configure the NovaPOS platform from initial installation through store-ready operation.',
      steps: [
        { heading: 'Access the Setup Wizard', body: 'On first login as an administrator, NovaPOS presents the Setup Wizard. The wizard guides you through company info, store location, currency, and base GL structure. Complete every step — partial setups cause posting errors later.', tips: ['Company name appears on all printed documents including receipts and invoices.', 'Timezone affects POS shift times and all audit log timestamps.'] },
        { heading: 'Configure the Fiscal Year', body: 'Navigate to Settings → Fiscal Calendar. Create your fiscal year with a start and end date. Then create fiscal periods (typically 12 monthly periods). Period dates must not overlap and must collectively cover the full fiscal year.', tips: ['Standard periods: Jan–Dec calendar year. Retail may use a 4-5-4 fiscal calendar.', 'Once transactions are posted to a period, the period start date cannot be changed.'] },
        { heading: 'Set Up Currencies and Exchange Rates', body: 'If you operate in a single currency, confirm the base currency under Settings → Currency. For multi-currency operations, add secondary currencies and configure daily exchange rate updates. NovaPOS can pull live rates via the currency API integration.', tips: ['All GL accounts report in the base currency. Multi-currency transactions auto-convert.'] },
        { heading: 'Configure Tax Codes', body: 'Navigate to Finance → Tax Management. Create tax codes for each applicable rate (e.g., Standard 8.875%, Exempt 0%). Link tax codes to GL posting accounts so tax collected posts to the correct tax liability account automatically.', tips: ['NovaPOS supports compound tax (tax on tax) for jurisdictions that require it.', 'Create separate tax codes for state and local if they post to different GL accounts.'] },
        { heading: 'Verify System Settings', body: 'Review Settings → System Preferences to confirm receipt format, date/time display format, decimal precision for quantities and amounts, and password policy settings. Run a test transaction in training mode to verify all settings before going live.', tips: ['Enable training mode under Settings → POS to allow test transactions that do not post.'] },
      ],
    },
    {
      id: 'admin-2', name: 'User Management', time: '25 min',
      objective: 'Create user accounts, assign roles, and configure permission sets for each staff member.',
      steps: [
        { heading: 'Create a New User Account', body: 'Navigate to Settings → Users → New User. Enter the staff member\'s full name, email address, and select their primary role (Admin, Manager, Cashier, or Accountant). NovaPOS sends an activation email with a temporary password. The user must change their password on first login.' },
        { heading: 'Assign Roles and Permissions', body: 'Each role has a predefined permission set. Admin has full access. Manager can manage inventory, view reports, and override transactions. Cashier can operate POS and process returns. Accountant can access Finance and Reports but not POS. Custom permission sets can be created for edge cases.', tips: ['Follow the principle of least privilege — grant only the access a role requires.', 'Permission changes take effect on the user\'s next login session.'] },
        { heading: 'Assign Users to Stores', body: 'In multi-store deployments, navigate to the user\'s profile and assign them to one or more store locations. Cashiers are typically restricted to a single store. Managers may be assigned to multiple stores for oversight. Admins have access to all stores by default.', tips: ['Store assignment controls which POS registers the user can open a shift on.'] },
        { heading: 'Set Up PIN-Based POS Login', body: 'For POS terminals, users can log in with a 4–6 digit PIN instead of a password for faster shift changes. Navigate to the user profile → POS Settings → Enable PIN Login. Each PIN must be unique across all users in the same store.', tips: ['PINs are hashed and stored securely. Supervisors can reset PINs without knowing the current PIN.'] },
        { heading: 'Manage User Sessions and Lockout', body: 'Under Settings → Security, configure session timeout (recommended 30 minutes for back-office, 5 minutes for POS). Set account lockout after failed login attempts. Review the Active Sessions panel to terminate suspicious sessions remotely.' },
      ],
    },
    {
      id: 'admin-3', name: 'Store Configuration', time: '30 min',
      objective: 'Configure store profiles, POS registers, tender types, and receipt templates.',
      steps: [
        { heading: 'Create Store Profiles', body: 'Navigate to Stores / HQ → New Store. Enter the store name, address, phone, and trading hours. Each store has its own GL mapping for sales and cash posting. For multi-store, create one profile per physical location plus a virtual e-commerce store if applicable.', tips: ['Store codes appear on all inter-store transfer documents and reports.'] },
        { heading: 'Configure POS Registers', body: 'Under each store, create POS registers (terminals). Assign each register a unique register number, a default cash account for float tracking, and a receipt printer. Registers can be configured for different workflows — retail, restaurant counter, or customer service desk.', tips: ['Each register independently tracks opening float and closing cash. Variances are per-register.'] },
        { heading: 'Set Up Tender Types', body: 'Configure accepted payment methods under Settings → Tender Types. For each tender (cash, Visa, Mastercard, store credit, gift card), specify the GL account it posts to, whether change can be given, and any processing fees. Enable or disable tender types per store.', tips: ['Gift card tenders must link to the gift card liability account.', 'Cash is the only tender type that normally generates change.'] },
        { heading: 'Configure Receipt Templates', body: 'NovaPOS provides default receipt templates for 80mm and 58mm thermal printers. Customize under Settings → Receipt Templates — add your logo (PNG, max 300px wide), tagline, return policy text, and loyalty program message. Test print before going live.' },
        { heading: 'Set Shift Reconciliation Rules', body: 'Configure whether shift close requires manager approval, the variance tolerance before an alert is triggered (e.g., ±$5.00), and whether the system auto-posts or holds for review. Strict environments should require manager sign-off on all variances.' },
      ],
    },
    {
      id: 'admin-4', name: 'Finance Configuration', time: '40 min',
      objective: 'Build your chart of accounts, configure posting profiles, and set up tax accounts.',
      steps: [
        { heading: 'Build the Chart of Accounts', body: 'Navigate to Finance → Chart of Accounts. NovaPOS provides a standard COA template that can be imported as a starting point. Review each account and modify or add accounts to match your accounting structure. Accounts are organized by type: Asset, Liability, Equity, Revenue, and Expense.', tips: ['Use consistent numbering: 1000s = Assets, 2000s = Liabilities, 3000s = Equity, 4000s = Revenue, 5000s–8000s = Expenses.'] },
        { heading: 'Configure General Posting Groups', body: 'Posting groups map transaction types to GL accounts automatically. Under Finance → Posting Profiles, create a General Posting Setup matrix that specifies which Revenue account POS sales post to, which COGS account inventory reductions use, and where discounts and shipping post.', tips: ['A complete posting matrix prevents unposted transaction errors at period close.'] },
        { heading: 'Set Up Bank Accounts', body: 'Navigate to Bank Accounts → New. Enter the bank name, account number (last 4 digits for security), currency, and link to the corresponding GL cash account. For each bank account, configure the default payment journal that posts deposits and withdrawals.' },
        { heading: 'Configure AR and AP Posting', body: 'Under Finance → Posting Profiles → Customer Posting Group, specify the AR Control account, Payment Discount Given, and Rounding accounts. Repeat for Vendor Posting Group with the AP Control account. These mappings determine how customer invoices and vendor bills hit the GL.', tips: ['AR and AP control accounts must not be used for any other transaction type.'] },
        { heading: 'Test End-to-End Posting', body: 'Before going live, run these test transactions and verify GL posting: a POS cash sale, a customer invoice, a vendor invoice, and a bank deposit. Review the posted entries under Finance → GL Journal Entries to confirm accounts are correct.' },
      ],
    },
    {
      id: 'admin-5', name: 'Reporting Setup', time: '25 min',
      objective: 'Configure standard reports, dashboards, and automated exports for your organization.',
      steps: [
        { heading: 'Configure Dashboard KPIs', body: 'The main dashboard pulls KPIs from your configured GL accounts. Under Settings → Dashboard, select which KPIs to display for each role. Cashiers see today\'s transaction count. Managers see store revenue and variance. Admins see the full financial overview.' },
        { heading: 'Set Up Scheduled Reports', body: 'Navigate to Reports → Scheduled Reports → New. Select a report template (e.g., Daily Sales Summary), set the frequency (daily, weekly, monthly), and specify delivery email addresses. NovaPOS generates and emails PDF reports automatically on the schedule.' },
        { heading: 'Create Report Filters and Saved Views', body: 'Most reports support filter combinations — by date range, store, product category, or customer group. Save frequently-used filter sets as named views so managers and accountants don\'t have to re-enter the same filters each time.' },
        { heading: 'Configure Export Templates', body: 'For accounting integrations, configure CSV export templates under Reports → Export Templates. Map NovaPOS fields to the column structure your external accounting software expects. Exports can be run manually or scheduled with scheduled reports.' },
      ],
    },
    {
      id: 'admin-6', name: 'Integrations', time: '35 min',
      objective: 'Connect NovaPOS to payment gateways, e-commerce platforms, and third-party services.',
      steps: [
        { heading: 'Payment Gateway Setup', body: 'Navigate to Settings → Integrations → Payment Gateways. NovaPOS supports Stripe, Square, and Authorize.Net for card-present and card-not-present transactions. Enter your API keys, configure the test environment first, and run test authorizations before switching to live mode.', tips: ['Store API keys in the NovaPOS secrets vault — never paste them in plain text fields.'] },
        { heading: 'E-Commerce Channel Connection', body: 'Under Settings → Commerce Channels, add your online storefronts. NovaPOS syncs inventory levels bidirectionally every 15 minutes by default. Map e-commerce product SKUs to NovaPOS item numbers to ensure accurate stock deductions when online orders are fulfilled.' },
        { heading: 'Email Service Configuration', body: 'NovaPOS sends transactional emails for receipts, invoices, and notifications. Configure your SMTP server credentials or use the built-in email relay (up to 1,000 emails/day included). Set the From address to a monitored inbox to capture bounces and replies.' },
        { heading: 'Webhook Configuration', body: 'NovaPOS can fire webhooks on key events: new sale, inventory below reorder point, new customer, shift close. Under Settings → Integrations → Webhooks → New, specify the endpoint URL and select which events to subscribe to. Use webhooks to trigger automation in connected systems.' },
      ],
    },
    {
      id: 'admin-7', name: 'Security & Audit', time: '20 min',
      objective: 'Configure audit logging, access controls, and security policies.',
      steps: [
        { heading: 'Review the Audit Log', body: 'Navigate to Settings → Security → Audit Log. Every user action that modifies data is recorded: who made the change, from which IP address, and what the before/after values were. The audit log cannot be edited or deleted — it is append-only.' },
        { heading: 'Configure IP Allow-Lists', body: 'For back-office access, restrict logins to trusted IP addresses (corporate office network, admin VPN). Under Settings → Security → IP Restrictions, add CIDR blocks for allowed addresses. POS terminals typically need a fixed IP or to be on a dedicated VLAN.' },
        { heading: 'Set Password and Session Policies', body: 'Enforce minimum password length (10+ characters), complexity requirements, and a 90-day rotation cycle. Set session idle timeout at 30 minutes for back-office and 5 minutes for POS. Enable two-factor authentication for all Admin role accounts.', tips: ['2FA for admins is critical — admin accounts can irreversibly modify GL and user data.'] },
        { heading: 'Review Open Sessions and Revoke Access', body: 'Regularly review Settings → Security → Active Sessions to see who is logged in, from where, and for how long. Terminate sessions for terminated employees immediately. Process offboarding by disabling accounts — never delete them, as their transaction history must be preserved.' },
      ],
    },
    {
      id: 'admin-8', name: 'Advanced Admin', time: '30 min',
      objective: 'Data archival, multi-store hierarchy, backup procedures, and advanced configuration.',
      steps: [
        { heading: 'Set Up Multi-Store Hierarchy', body: 'For chains, NovaPOS supports a Head Office (HQ) → District → Store hierarchy. Configure the hierarchy under Stores / HQ → Hierarchy. HQ-level settings (price lists, promotions, COA) cascade down to district and store levels. Stores can override select settings with HQ approval.' },
        { heading: 'Configure Data Archival', body: 'To maintain performance, archive completed transactions older than 24 months under Settings → Data Management → Archive Policy. Archived data is compressed and moved to read-only storage but remains queryable from Reports. Archiving does not delete data.' },
        { heading: 'Backup and Restore Procedures', body: 'NovaPOS performs automated nightly database backups retained for 30 days. For on-premises deployments, configure the backup destination (network share or cloud bucket) under Settings → Backup. Test restore procedures quarterly — an untested backup is not a backup.' },
        { heading: 'System Health Monitoring', body: 'The Admin → System Health dashboard shows database size, active connection count, job queue depth, and API response times. Set alert thresholds so you are notified before issues become outages. Review the health dashboard weekly and after major data imports.' },
      ],
    },
  ],

  manager: [
    {
      id: 'mgr-1', name: 'Daily Operations', time: '30 min',
      objective: 'Master the daily opening, shift monitoring, and end-of-day close procedures.',
      steps: [
        { heading: 'Opening Procedures', body: 'Arrive before opening time and log into NovaPOS. Navigate to the POS terminal for your store and click "Open Shift." Enter the opening float — count the starting cash physically and enter the exact amount. Any discrepancy from the expected float is flagged immediately.', tips: ['Check that receipt paper is loaded and the cash drawer closes fully before the first transaction.'] },
        { heading: 'Monitor Active Shifts', body: 'From the Manager dashboard, navigate to POS → Active Shifts to see all open shifts across your store in real time. You can view each cashier\'s transaction count, tender totals, and any voided or suspended transactions. Unusual patterns (excessive voids, large discounts) appear highlighted.' },
        { heading: 'Handle Overrides and Approvals', body: 'Discounts above the cashier threshold, price overrides, and post-tender voids require manager approval. When a cashier requests an override, you receive an in-app notification. Navigate to Approvals, review the request details, and approve or deny with a reason.', tips: ['Always review the full transaction before approving a price override — the cashier may have made an error.'] },
        { heading: 'End-of-Day Procedures', body: 'Before closing, verify all orders placed during the day have been fulfilled or cancelled. Run the Daily Sales Report under Reports → Sales → Daily Summary. At close, navigate to POS → Close Shift for each terminal, review the reconciliation, and post approved shifts to the GL.' },
      ],
    },
    {
      id: 'mgr-2', name: 'Inventory Management', time: '35 min',
      objective: 'Oversee stock levels, coordinate counts, process transfers, and manage reorder points.',
      steps: [
        { heading: 'Review Daily Stock Alerts', body: 'Navigate to Inventory → Alerts. NovaPOS surfaces items below reorder point in red, items at minimum in amber. Review daily to decide whether to create a purchase order immediately or wait for a scheduled replenishment run.', tips: ['Sort by days of stock remaining to prioritize the most urgent reorders.'] },
        { heading: 'Schedule Physical Inventory Counts', body: 'Navigate to Inventory → Count Schedules → New Count. Select the scope (full inventory, zone count, or single category), assign the count team, and set the count date. NovaPOS generates count sheets or pushes tasks to handheld scanners. Counts should be performed outside trading hours when possible.' },
        { heading: 'Process Inventory Adjustments', body: 'After a count, navigate to the count record and enter actual quantities. NovaPOS calculates the variance (counted vs system). Review variances above your tolerance threshold before posting. Posted adjustments update the GL inventory account and create an adjustment journal entry automatically.' },
        { heading: 'Manage Inter-Store Transfers', body: 'When one location has excess stock and another is short, create an Inventory Transfer under Inventory → Transfers → New. Select the source store, destination store, items, and quantities. The source reduces inventory on shipment; the destination increases on receipt. Both events create GL entries.' },
        { heading: 'Create and Approve Purchase Orders', body: 'NovaPOS can auto-suggest purchase orders based on reorder points. Review suggestions under Purchasing → Suggestions, adjust quantities, and convert to a PO. POs require manager approval before release to the vendor. Once approved, the PO is emailed to the vendor automatically if email is configured.' },
      ],
    },
    {
      id: 'mgr-3', name: 'Staff Management', time: '25 min',
      objective: 'Manage employee schedules, approve time-off, and review performance metrics.',
      steps: [
        { heading: 'Build Weekly Schedules', body: 'Navigate to HR → Schedules → New Schedule. Select the week and add shifts for each employee. NovaPOS shows labor cost projections as you build the schedule based on each employee\'s pay rate. Publish the schedule to make it visible to staff.', tips: ['Published schedules push notifications to employees via their registered email.'] },
        { heading: 'Approve Time-Off Requests', body: 'Employees submit time-off requests through their NovaPOS profile. Managers receive a notification in the Approvals queue. Review against the current schedule coverage before approving. Denials require a reason, which is communicated to the employee automatically.' },
        { heading: 'Review Time Clock Records', body: 'Navigate to HR → Time Clock → Records. Review daily clock-in/out times for accuracy. Correct erroneous punches (missed clock-outs, early departures) with an edit note. Edited records are flagged in the audit log and require manager authentication to save.', tips: ['Unreviewed time records cannot be included in a payroll run.'] },
        { heading: 'Monitor Sales Performance', body: 'Navigate to Reports → Staff Performance. View each cashier\'s transaction count, average transaction value, return rate, and items per transaction over any date range. Use this data for coaching conversations and recognition.' },
      ],
    },
    {
      id: 'mgr-4', name: 'Sales Reports', time: '25 min',
      objective: 'Understand and act on key sales reports to drive store performance.',
      steps: [
        { heading: 'Daily Sales Summary', body: 'Navigate to Reports → Sales → Daily Summary. This report shows gross sales, discounts given, net sales, and tender breakdown for the current or selected day. Compare to the same day last week and last year to understand trend. Export to PDF for daily briefing.' },
        { heading: 'Product Performance Report', body: 'Reports → Sales → By Product shows each item\'s units sold, revenue, cost, and gross margin for the period. Sort by revenue descending to identify top sellers. Sort by margin ascending to identify items dragging profitability. Use this to inform promotions and reorder decisions.' },
        { heading: 'Hourly Traffic Report', body: 'Reports → Sales → Hourly Breakdown shows transaction count and revenue by hour of day. Use this to optimize staffing schedules — schedule more cashiers during peak hours and reduce labor in slow periods. Typically shows a lunch peak, mid-afternoon lull, and pre-close rush in retail.' },
        { heading: 'Customer Contribution Report', body: 'Reports → Customers → Sales Contribution ranks customers by purchase value over the period. Identify your top 20% of customers who typically generate 80% of revenue. Use this list to send targeted loyalty campaigns or personally thank high-value customers.' },
      ],
    },
    {
      id: 'mgr-5', name: 'Customer Service', time: '20 min',
      objective: 'Handle escalations, manage refunds beyond cashier limits, and resolve loyalty issues.',
      steps: [
        { heading: 'Process Manager-Level Refunds', body: 'Refunds above the cashier threshold require manager authentication. Navigate to the original transaction via Orders → search by receipt number. Verify the items match the physical return, then authorize the refund. Refunds exceeding 30 days require a reason code.', tips: ['Never process a refund without seeing the original receipt or looking up the transaction in NovaPOS.'] },
        { heading: 'Adjust Loyalty Points', body: 'Navigate to Customers → select the customer → Loyalty tab. Managers can manually add or deduct loyalty points with a reason (e.g., goodwill adjustment, data correction). All manual adjustments are logged and attributed to your user account.' },
        { heading: 'Handle Customer Complaints', body: 'Document customer complaints under Customers → Customer Card → Notes. Record the issue, resolution, and any compensation offered. This creates a service history visible to all staff, preventing repeat complaints from being unacknowledged.' },
        { heading: 'Issue Store Credit', body: 'When a customer declines a cash refund or for goodwill gestures, issue store credit via Customers → select customer → Issue Credit. Specify the amount and expiry date. Store credit can be redeemed at the POS by searching the customer name or scanning their loyalty card.' },
      ],
    },
    {
      id: 'mgr-6', name: 'Promotions', time: '25 min',
      objective: 'Create and manage price rules, promotional campaigns, and discount structures.',
      steps: [
        { heading: 'Create a Price Rule', body: 'Navigate to Commerce → Promotions → New Promotion. Choose the promotion type: percentage discount, fixed amount off, buy-X-get-Y, or mix-and-match bundle. Set the active date range, applicable items or categories, and minimum transaction value if required.', tips: ['Overlapping promotions are resolved by priority order — set higher priority for the promotion you want to win.'] },
        { heading: 'Customer Group Pricing', body: 'For wholesale or VIP customers, create special price lists under Settings → Price Lists → New. Assign the price list to a customer group. All customers in that group automatically receive the special pricing at POS without any cashier action required.' },
        { heading: 'Configure Coupon Codes', body: 'Navigate to Commerce → Promotions → Coupons. Create single-use or multi-use coupon codes with an expiry date and maximum redemption count. Cashiers enter the code during a transaction or customers enter it at online checkout. Redemption counts update in real time.' },
        { heading: 'Review Promotion Performance', body: 'After a campaign ends, navigate to Reports → Promotions → Campaign Analysis. Review total discount given, number of transactions that used the promotion, revenue impact, and margin impact. Use this data to decide whether to repeat or modify the promotion.' },
      ],
    },
  ],

  cashier: [
    {
      id: 'cash-1', name: 'POS Basics', time: '25 min',
      objective: 'Navigate the POS terminal interface, open a shift, and find items.',
      steps: [
        { heading: 'Open the POS Terminal', body: 'Navigate to the POS Terminal page from the main navigation. The terminal screen shows the item basket on the left and the payment area on the right. Before any transactions can be processed, a shift must be opened.' },
        { heading: 'Open Your Shift', body: 'Click the "Open Shift" button and enter your opening float — the amount of cash physically in the drawer at the start of your shift. Count all bills and coins carefully and enter the exact total. Your manager has set a target float amount; large variances are flagged immediately.', tips: ['Count your float twice before entering the amount.', 'If the expected float differs from what you were given, notify your manager before opening.'] },
        { heading: 'Search for Items', body: 'Use the item search bar at the top of the basket to find products. You can scan a barcode, type the item name, or type the SKU number. The search is instant — results appear as you type. Tap or click an item to add it to the basket.' },
        { heading: 'Adjust Quantities and Apply Discounts', body: 'After adding an item, tap the quantity to change it. Tap the price to apply a line-level discount (if your permissions allow). Enter the discount as a percentage or fixed amount. Line discounts appear in the basket and are tracked in reports.', tips: ['Discounts above your permitted threshold will prompt for a manager PIN.'] },
        { heading: 'Navigate the Interface', body: 'The top bar shows the current shift time, your name, and a notification icon. The left panel is the basket. The right panel shows payment options after you click Charge. The function bar at the bottom contains Suspend, Void, Recall, and No Sale buttons.' },
      ],
    },
    {
      id: 'cash-2', name: 'Processing Transactions', time: '25 min',
      objective: 'Complete a full sale from item scan to payment and receipt.',
      steps: [
        { heading: 'Build the Transaction', body: 'Add all items to the basket by scanning barcodes or searching. Verify the item names and prices in the basket match what the customer is purchasing. The basket shows a running subtotal, tax, and total. Discounts applied appear in green beneath the item price.' },
        { heading: 'Select a Customer (Optional)', body: 'If the customer has a loyalty account, click the Customer button and search by name, email, or phone number. Attaching a customer earns loyalty points and stores the transaction in their purchase history. For guest purchases, skip this step.' },
        { heading: 'Process Payment', body: 'Click "Charge" to open the payment screen. The total due is shown prominently. Select the tender type — Cash, Card, or Gift Card. For cash, enter the amount tendered; NovaPOS calculates change. For card, follow the card terminal prompts.' },
        { heading: 'Split Tender Transactions', body: 'If the customer wants to pay with multiple methods (e.g., $20 cash + card for the rest), select Cash first, enter $20.00, then click "Add Another Tender." Select Card for the remaining balance. Split tender transactions are fully supported and reported accurately.' },
        { heading: 'Complete the Sale and Print Receipt', body: 'After payment is confirmed, the sale posts and the receipt prints automatically (if a printer is connected). You can also email the receipt — enter the customer\'s email address on the completion screen. The basket clears and the terminal is ready for the next transaction.', tips: ['Always hand the customer their receipt — it is required for returns.'] },
      ],
    },
    {
      id: 'cash-3', name: 'Returns & Exchanges', time: '20 min',
      objective: 'Process customer returns, exchanges, and issue refunds correctly.',
      steps: [
        { heading: 'Locate the Original Transaction', body: 'Navigate to Orders and search by the receipt number printed on the customer\'s receipt, or by the customer name if they have an account. Open the transaction to view the items purchased. Verify the items being returned match the transaction.', tips: ['You cannot process a return for items not on the original transaction.', 'Returns without a receipt may require manager approval.'] },
        { heading: 'Select Items to Return', body: 'On the original transaction screen, click "Return Items." Check the items the customer is returning. Enter the return quantity for each item (must not exceed the originally purchased quantity). The system calculates the refund amount.' },
        { heading: 'Process the Refund', body: 'Select the refund method: original tender (cash back or card reversal), store credit, or exchange. Refunds to the original card typically take 3–5 business days to appear on the customer\'s statement. Cash refunds are immediate. Confirm the refund to post the return.', tips: ['If the original payment was by card, best practice is to refund to the same card.'] },
        { heading: 'Handle Exchanges', body: 'For an exchange, process the return first to bring the item back into inventory and generate a credit. Then build a new transaction with the replacement item. Apply the credit from the return to offset the new transaction cost. Any balance due is collected, or excess is refunded.' },
        { heading: 'Return the Item to Stock', body: 'After posting the return, the inventory system updates automatically. Inspect the returned item — if it is sellable, it goes back on the shelf. If it is damaged, navigate to Inventory → Adjustments → New and write the item off to the appropriate damage GL account.' },
      ],
    },
    {
      id: 'cash-4', name: 'End of Day', time: '20 min',
      objective: 'Count the cash drawer, close the shift, and hand off the terminal.',
      steps: [
        { heading: 'Complete All Pending Transactions', body: 'Before closing your shift, ensure all open transactions are completed or suspended. Check that no transactions are in a suspended state that should be voided. Suspended transactions older than your shift block shift close until resolved.', tips: ['If you have a customer still deciding, it is fine to leave a suspended transaction for the next shift.'] },
        { heading: 'Count the Cash Drawer', body: 'Click "Close Shift" to begin reconciliation. NovaPOS shows the expected cash total (opening float + cash sales − cash refunds). Count your physical cash by denomination: count pennies, nickels, dimes, quarters, and each bill denomination separately. Enter the counted totals.' },
        { heading: 'Review the Variance', body: 'NovaPOS compares your counted cash to the expected total and shows the variance. A zero variance is ideal. Small variances (±$1–2) are normal due to rounding and are within tolerance. Larger variances are flagged for manager review. Be honest — do not adjust your count to match the expected amount.', tips: ['A systematic over/under count (e.g., always $10 short) suggests a pattern that should be investigated.'] },
        { heading: 'Print Shift Reports and Submit', body: 'Click "Print Shift Report" to generate a summary of all transactions for your shift. Hand the shift report to your manager or leave it in the designated spot. Click "Submit Shift" — a manager must approve the close, after which the shift posts to the GL and your session ends.' },
      ],
    },
  ],

  accountant: [
    {
      id: 'acct-1', name: 'Chart of Accounts', time: '30 min',
      objective: 'Create, organize, and maintain the NovaPOS general ledger chart of accounts.',
      steps: [
        { heading: 'Understand the Account Structure', body: 'NovaPOS uses a five-digit account numbering scheme by default. Accounts are grouped by type: 10000–19999 (Assets), 20000–29999 (Liabilities), 30000–39999 (Equity), 40000–49999 (Revenue), 50000–89999 (Expenses). Sub-accounts are created as children of parent summary accounts.' },
        { heading: 'Create a New Account', body: 'Navigate to Finance → Chart of Accounts → New Account. Enter the account number, name, type (Asset, Liability, Equity, Revenue, Expense), and sub-type (e.g., Current Asset, Fixed Asset). Specify whether the account is a posting account (accepts transactions) or a summary/header account.', tips: ['Summary accounts do not accept direct postings — they aggregate child account balances.'] },
        { heading: 'Configure Account Settings', body: 'For each posting account, configure: the default direct-posting flag (can be debited/credited manually), the reconciliation requirement (bank accounts must be reconciled), currency (base or specific foreign currency), and the tax posting group if applicable.' },
        { heading: 'Modify Existing Accounts', body: 'Navigate to the account and click Edit. You can change the name, sub-type, and posting configuration. You cannot change the account number after transactions have been posted to it. To renumber, create a new account and use a reclassification journal to move the balance.' },
        { heading: 'Review and Print the Trial Balance', body: 'Navigate to Reports → Financial → Trial Balance. Select the period and confirm that total debits equal total credits. A non-zero difference indicates a data integrity issue. Print the trial balance for management review at the end of each period close.', tips: ['Run the trial balance before and after every period close to confirm no drift.'] },
      ],
    },
    {
      id: 'acct-2', name: 'AP / AR Workflows', time: '45 min',
      objective: 'Process vendor invoices, customer invoices, payments, and collections.',
      steps: [
        { heading: 'Create a Customer Invoice', body: 'Navigate to AR → New Customer Invoice. Select the customer, enter the invoice date and due date (based on payment terms). Add line items — NovaPOS can pull lines from an open sales order. Review the posting preview to confirm which GL accounts will be debited/credited. Post the invoice.' },
        { heading: 'Apply a Customer Payment', body: 'Navigate to AR → Cash Receipts → New. Select the customer and enter the payment amount and date. NovaPOS shows all open invoices for that customer. Apply the payment to one or multiple invoices. If the payment is partial, the remaining balance stays open. Post the receipt.', tips: ['Use the auto-apply function to match payments to the oldest invoice first (standard aging practice).'] },
        { heading: 'Create a Vendor Invoice', body: 'Navigate to Purchasing → AP Invoices → New. Select the vendor and enter the vendor\'s invoice number, invoice date, and payment due date. If a purchase order exists, click "Get PO Lines" to populate the invoice from the PO receipt. Verify quantities and unit costs match the vendor\'s invoice.' },
        { heading: 'Run a Payment Batch', body: 'Navigate to AP → Payment Runs → New. Set the payment date and cut-off date (pay all invoices due by this date). NovaPOS suggests invoices to pay sorted by due date. Review and deselect any invoices to hold. Select the payment bank account and generate the batch. Post the batch to mark invoices as paid and create bank entries.' },
        { heading: 'Manage Collections', body: 'Navigate to AR → Aging Report to see invoices by aging bucket (current, 30, 60, 90+ days). For overdue invoices, send a payment reminder directly from NovaPOS under the invoice → Actions → Send Reminder. For seriously overdue accounts, place the customer on credit hold under their customer card.', tips: ['Credit holds block new orders and POS sales for that customer until released by an authorized user.'] },
      ],
    },
    {
      id: 'acct-3', name: 'Bank Reconciliation', time: '35 min',
      objective: 'Reconcile bank statements against NovaPOS records and clear outstanding items.',
      steps: [
        { heading: 'Import or Enter Bank Statements', body: 'Navigate to Bank Accounts → select account → Reconcile. Upload your bank statement in OFX, CSV, or MT940 format, or manually enter transactions if electronic import is not available. The statement import creates pending entries that you will match against the NovaPOS GL.' },
        { heading: 'Auto-Match Transactions', body: 'Click "Auto-Match" to let NovaPOS match bank statement lines to GL entries by amount and date proximity. Most high-volume, recurring transactions (daily POS deposits, fixed payments) match automatically. Unmatched items appear in the reconciliation work area for manual matching.' },
        { heading: 'Manually Match Remaining Items', body: 'For unmatched bank lines, click the line and browse the GL entries panel on the right. Select the GL entry that matches. For combined bank deposits (single deposit from multiple shifts), use the "Match to Multiple" option to select several GL entries that sum to the bank amount.' },
        { heading: 'Clear Outstanding Checks', body: 'Outstanding checks (issued but not yet cleared) appear in the reconciliation as unmatched GL entries. When the bank statement shows them cleared, match them. Checks outstanding longer than 90 days should be investigated — they may need to be voided and reissued.' },
        { heading: 'Post the Reconciliation', body: 'When the reconciliation difference is zero (or within a small rounding tolerance), click "Post Reconciliation." NovaPOS marks all matched entries as reconciled, creates any adjustment entries you authorized, and records the reconciliation date. The bank register now shows the reconciled balance.' },
      ],
    },
    {
      id: 'acct-4', name: 'Period Close', time: '35 min',
      objective: 'Execute the month-end and year-end close checklist in NovaPOS.',
      steps: [
        { heading: 'Run the Pre-Close Checklist', body: 'Navigate to Finance → Period Close → Month-End Checklist. NovaPOS lists all required steps with status indicators. Common pre-close tasks: verify all POS shifts are posted, confirm AP invoices match receiving, complete the bank reconciliation, and post all recurring journals.' },
        { heading: 'Post Accruals and Prepayments', body: 'Create month-end accrual entries for expenses incurred but not yet invoiced (accrued utilities, wages, etc.). Navigate to Finance → Journals → New → select Accrual type. Enter the debit and credit lines. Accrual journals automatically reverse on the first day of the next period when configured with a reversal date.', tips: ['Date your accruals with the last day of the period, not the posting date.'] },
        { heading: 'Run Depreciation', body: 'Navigate to Finance → Fixed Assets → Calculate Depreciation. Select the period and click Calculate. NovaPOS computes depreciation for all active assets based on their depreciation schedule (straight-line, declining balance, etc.). Review the depreciation preview before posting to GL.' },
        { heading: 'Close the Period', body: 'After all entries are posted and reviewed, navigate to Settings → Fiscal Calendar → select the period → Close Period. A closed period prevents any further posting to those dates. If you need to post an entry to a closed period, an Admin must re-open it — this requires documentation and a second approval.', tips: ['Print the trial balance immediately before and after period close as an audit artifact.'] },
        { heading: 'Year-End Close', body: 'At fiscal year-end, run the additional year-end steps: close income and expense accounts to retained earnings, create the opening balances for the new year, and archive the prior year GL. Navigate to Finance → Year-End Close Wizard which guides you through all required steps in order.' },
      ],
    },
    {
      id: 'acct-5', name: 'Financial Reports', time: '30 min',
      objective: 'Generate and interpret the core financial statements in NovaPOS.',
      steps: [
        { heading: 'Income Statement (P&L)', body: 'Navigate to Reports → Financial → Income Statement. Select the date range (month, quarter, YTD). The report shows Revenue, Cost of Goods Sold, Gross Profit, Operating Expenses, and Net Income. The comparative column shows the same period last year. Export to PDF for board or management review.', tips: ['A gross margin below 30% in retail usually indicates a pricing or cost control issue worth investigating.'] },
        { heading: 'Balance Sheet', body: 'Navigate to Reports → Financial → Balance Sheet. As of any date, view Assets (current and fixed), Liabilities (current and long-term), and Equity (paid-in capital and retained earnings). Total Assets must equal Total Liabilities + Equity. Any difference indicates a posting error.' },
        { heading: 'Cash Flow Statement', body: 'Navigate to Reports → Financial → Cash Flow. This report categorizes cash movements into Operating Activities (customer collections, vendor payments), Investing Activities (asset purchases), and Financing Activities (loans, equity). Positive operating cash flow confirms the business generates cash from operations.' },
        { heading: 'AR Aging and AP Aging', body: 'Navigate to Reports → AR → Aging for receivables. Navigate to Reports → AP → Aging for payables. Both reports bucket amounts by 0–30, 31–60, 61–90, and 91+ days. Use these weekly to prioritize collections calls and manage payment timing to optimize cash flow.' },
        { heading: 'Build a Custom Report', body: 'Navigate to Reports → Custom Reports → New. Use the drag-and-drop designer to select data fields, grouping, sorting, and subtotals. Save the report to your favorites for quick access. Custom reports can be scheduled for automated delivery in the same way as standard reports.' },
      ],
    },
  ],
}

export default async function RoleTrainingPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params
  const meta = ROLE_META[role]
  const modules = MODULES[role]

  if (!meta || !modules) notFound()

  return (
    <>
      <TopBar title={`${meta.label} Training`} />
      <main className="flex-1 p-6 overflow-auto max-w-4xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
          <Link href="/help" className="hover:text-zinc-300 transition-colors">Help Center</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/help/training" className="hover:text-zinc-300 transition-colors">Training Paths</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-400">{meta.label}</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${meta.iconBg}`}>
              <meta.icon className={`w-6 h-6 ${meta.color}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">{meta.label} Training Path</h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                {modules.length} modules · Complete at your own pace · Progress saves in your browser
              </p>
            </div>
          </div>
        </div>

        {/* Client: accordion + mark complete */}
        <TrainingClient role={role} modules={modules} />

      </main>
    </>
  )
}
