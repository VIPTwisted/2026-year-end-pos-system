export interface TrainingStep {
  step: number
  title: string
  description: string
}

export interface TrainingConcept {
  term: string
  definition: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface TrainingModule {
  id: string
  title: string
  icon: string
  category: 'Core Finance' | 'Operations' | 'Period Close'
  estimatedMinutes: number
  overview: string
  concepts: TrainingConcept[]
  steps: TrainingStep[]
  faqs: FAQ[]
  tips: string[]
}

export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'general-ledger',
    title: 'General Ledger Setup',
    icon: 'BookOpen',
    category: 'Core Finance',
    estimatedMinutes: 15,
    overview:
      'The General Ledger is the financial backbone of every legal entity in Dynamics 365 Finance. For each legal entity, you must configure the chart of accounts, account structures, fiscal calendar, and currencies on the Ledger page. You can share a single chart of accounts across multiple legal entities to simplify maintenance, while using legal entity overrides for entity-specific exceptions.',
    concepts: [
      {
        term: 'Chart of Accounts',
        definition:
          'A shared list of main accounts used by one or more legal entities. Configured on the Ledger page per legal entity. Once transactions are posted, the chart of accounts cannot be changed without clearing all posting profiles first.',
      },
      {
        term: 'Account Structures',
        definition:
          'Rules that define which financial dimension combinations are valid for a given set of main accounts. Account structures are attached to the ledger and control how account + dimension combinations are formed on journal lines.',
      },
      {
        term: 'Legal Entity Override',
        definition:
          'A mechanism that allows a specific legal entity to deviate from the shared chart of accounts configuration while still benefiting from a shared baseline, reducing duplicated maintenance across entities.',
      },
      {
        term: 'Foreign Currency Revaluation',
        definition:
          'A period-end process that revalues general ledger account balances held in foreign currencies using current, historical, or average exchange rates. Creates unrealized gain or loss transactions to bring subledgers and the GL into alignment.',
      },
      {
        term: 'Ledger Journal Types',
        definition:
          'Predefined journal categories (Allocation, Approval, Daily, Budget, Accrual, Periodic, etc.) that control which transaction pages are used and which posting rules apply. Set up on the Journal Names page.',
      },
      {
        term: 'Posting Definitions',
        definition:
          'Rules that automatically generate additional ledger entries when a source transaction matches defined criteria. Used for encumbrances on purchase orders and budget appropriations, and must be enabled on the General Ledger Parameters page.',
      },
    ],
    steps: [
      {
        step: 1,
        title: 'Navigate to the Ledger page',
        description:
          'Go to General ledger > Ledger setup > Ledger. This page is where you configure the entire financial setup for the selected legal entity.',
      },
      {
        step: 2,
        title: 'Select the Chart of Accounts',
        description:
          'On the Ledger page, select Chart of accounts and choose the appropriate chart from the list. If multiple legal entities share the same chart, select the same value in each entity. You cannot change the chart of accounts after transactions have been posted.',
      },
      {
        step: 3,
        title: 'Attach Account Structures',
        description:
          'Add the account structures that define valid main account and financial dimension combinations for your legal entity. Account structures must be created on the Account structures page before they can be attached here.',
      },
      {
        step: 4,
        title: 'Set the Fiscal Calendar',
        description:
          'Select the fiscal calendar to use for the legal entity. The fiscal calendar determines available posting periods and must be created on the Fiscal calendars page before it can be linked to the ledger.',
      },
      {
        step: 5,
        title: 'Configure Currencies',
        description:
          'Set the accounting currency (functional currency) and, if applicable, a reporting currency. If you plan to run foreign currency revaluation, also configure currency codes, exchange rate types, and currency exchange rates.',
      },
      {
        step: 6,
        title: 'Set Up Journal Names',
        description:
          'Go to General ledger > Journal setup > Journal names. Create named journals for each journal type your organization uses (Daily, Accrual, Allocation, etc.). Each journal name is tied to a journal type that controls its behavior.',
      },
      {
        step: 7,
        title: 'Enable Posting Definitions (if required)',
        description:
          'If your organization uses purchase order encumbrances or budget appropriations, go to General ledger > Ledger setup > General ledger parameters and enable Use posting definitions. Then configure rules on the Posting definitions page.',
      },
      {
        step: 8,
        title: 'Mark Main Accounts for Revaluation',
        description:
          'On the Main account page, mark the Foreign currency revaluation checkbox for each account that should be revalued at period-end. Clear this option for AR and AP accounts that are revalued in their own subledgers to avoid double-counting.',
      },
    ],
    faqs: [
      {
        question: 'Can I change the chart of accounts after transactions have been posted?',
        answer:
          'No. Once transactions have been posted in a legal entity, the chart of accounts cannot be changed. Even without posted transactions, you may see an error if posting profiles have default accounts referencing the current chart. You must clear all affected posting profiles before the change is allowed. Expand the error message bar to see a detailed list of every affected posting profile table, field, and company.',
      },
      {
        question: 'Should AR and AP main accounts be included in the General Ledger foreign currency revaluation?',
        answer:
          'No. Bank, Accounts Receivable, and Accounts Payable each have their own foreign currency revaluation processes that create accounting entries in the General Ledger. Including those main accounts in the GL revaluation would result in double-counting. Exclude AR, AP, and Bank main accounts from the GL revaluation by clearing the Foreign currency revaluation checkbox on the Main account page for those accounts.',
      },
      {
        question: 'What journal type should I use for standard daily transactions?',
        answer:
          'Use the Daily journal type for general day-to-day transactions. For vendor invoice approval, use the Approval journal type. For period allocations, use the Allocation type. Refer to the Ledger journal types documentation and use the Journal names page to configure named instances of each type your organization requires.',
      },
    ],
    tips: [
      'Share one chart of accounts across legal entities wherever possible — legal entity overrides handle exceptions without duplicating the entire structure.',
      'Perform foreign currency revaluation setup and testing in a sandbox environment during scheduled maintenance to avoid schema lock conflicts.',
      'When enabling posting definitions for encumbrances, configure all expense account rules before going live to ensure purchase orders are properly reserved in the GL.',
    ],
  },

  {
    id: 'dimensions',
    title: 'Financial Dimensions',
    icon: 'Layers',
    category: 'Core Finance',
    estimatedMinutes: 10,
    overview:
      'Financial dimensions in Dynamics 365 Finance add analytical layers to main accounts, enabling detailed reporting by cost center, department, project, or any custom segment your organization defines. Activating a new dimension triggers a database schema change that adds columns to the DimensionAttributeValueCombination and DimensionAttributeValueSet tables, so activation must be performed during scheduled maintenance in production environments.',
    concepts: [
      {
        term: 'Financial Dimension',
        definition:
          'An analytical segment attached to ledger transactions alongside the main account. Examples include Department, Cost Center, and Project. Each dimension adds a column to key dimension tables when activated.',
      },
      {
        term: 'Dimension Activation',
        definition:
          'The process of making a newly created financial dimension consumable in account structures, journals, and reports. It triggers a SQL Server schema lock on two core tables while columns are added. Should be run during scheduled downtime in production.',
      },
      {
        term: 'DimensionAttributeValueCombination',
        definition:
          'The core database table that stores all unique combinations of main account and financial dimension values. A new column is added to this table each time Dimension activation runs for a new dimension.',
      },
      {
        term: 'Rebuild Financial Dimensions',
        definition:
          'An option on the Activate financial dimensions page, set to No by default, that re-creates the dimension schema from scratch. Only use this option if unexpected results occur during the initial activation — it is a heavyweight process.',
      },
      {
        term: 'Account Structure',
        definition:
          'A configuration layer that defines which financial dimensions are required, optional, or locked for a given set of main accounts. Dimensions cannot be added to account structures until Dimension activation has been run for that dimension.',
      },
      {
        term: 'Dimension Activation Privilege',
        definition:
          'A special security privilege required to run the Dimension activation process. Because the action causes a schema-level database change, it is intentionally restricted to authorized users and should only be exercised during maintenance windows.',
      },
    ],
    steps: [
      {
        step: 1,
        title: 'Plan the dimension before creating it',
        description:
          'Decide on the dimension name, values, and which account structures will use it. Adding a financial dimension is a deliberate business process — adding unnecessary dimensions creates permanent schema overhead that cannot be easily reversed.',
      },
      {
        step: 2,
        title: 'Create the financial dimension',
        description:
          'Go to General ledger > Chart of accounts > Dimensions > Financial dimensions. Click New, enter the dimension name and configuration. After saving, a warning message will state the dimension is not yet consumable until Dimension activation runs.',
      },
      {
        step: 3,
        title: 'Schedule a maintenance window',
        description:
          'In production environments, Dimension activation requires maintenance mode. Coordinate with your system administrator to schedule downtime. In sandbox or UAT environments, activation can be performed without full maintenance mode, but a service restart may still be needed.',
      },
      {
        step: 4,
        title: 'Run Dimension activation',
        description:
          'Go to General ledger > Chart of accounts > Dimensions > Activate financial dimensions. Only one user should attempt this process in a multi-user environment. SQL Server places a schema lock on the two dimension tables during the process — do not open journals at this time.',
      },
      {
        step: 5,
        title: 'Refresh the session after activation',
        description:
          'If a deadlock or metadata error occurs during activation (common when a journal is open), refresh your browser session to pull updated metadata from the server. The dimension will be consumable once the process completes without error.',
      },
      {
        step: 6,
        title: 'Add the dimension to account structures',
        description:
          'After activation completes, navigate to the Account structures page and add the new dimension to the appropriate account structure rules. Define whether the dimension is required, optional, or has a fixed value for each main account segment.',
      },
    ],
    faqs: [
      {
        question: 'Can I activate financial dimensions in a production environment without maintenance mode?',
        answer:
          'No. In production environments, the Dimension attribute activation entity is blocked to maintain system stability and data integrity. Activating dimensions in production requires maintenance mode to ensure the required schema changes are fully replicated across all AOS caches and no open database transactions are impacted. Sandbox environments continue to support activation without full maintenance mode, though a service restart may still be required to synchronize AOS caches.',
      },
      {
        question: 'What happens if I try to activate a dimension while a journal is open?',
        answer:
          'A deadlock may occur. SQL Server places a schema lock on the DimensionAttributeValueCombination and DimensionAttributeValueSet tables during activation. If a journal is open at the same time, the competing lock causes a deadlock and you may receive a metadata error from the server. Close all open journals before running Dimension activation, and refresh your session if an error occurs.',
      },
      {
        question: 'When should I use the Rebuild financial dimensions option?',
        answer:
          'The Rebuild financial dimensions option is set to No by default and should only be used if unexpected results occur during the initial activation. It is a heavyweight process that re-creates the dimension schema from scratch. Do not use it as a routine activation step — only escalate to Rebuild if the standard activation produces errors that cannot be resolved by retrying the activation.',
      },
    ],
    tips: [
      'Always perform Dimension activation during scheduled downtime in production — the schema lock can block other users from posting transactions.',
      'In multi-user environments (UAT, training), designate a single person to run activation. Concurrent activation attempts cause conflicts.',
      'Map out all account structures that will reference the new dimension before activation — you cannot add the dimension to structures until after activation completes.',
    ],
  },

  {
    id: 'accounts-payable',
    title: 'Accounts Payable',
    icon: 'ArrowUpCircle',
    category: 'Operations',
    estimatedMinutes: 20,
    overview:
      'Accounts Payable in Dynamics 365 Finance covers the full vendor payment lifecycle: vendor setup, purchase orders, invoice entry, three-way matching, and payment processing. Before configuring AP, prerequisite setup in General Ledger (payment journals, exchange rates) and Cash and Bank Management (bank accounts) must be completed. Invoice matching policies — two-way or three-way — ensure vendors are paid only after purchase orders and product receipts are reconciled against the invoice.',
    concepts: [
      {
        term: 'Vendor Groups',
        definition:
          'Logical groupings of vendors that share important parameters for posting, settlement, and reporting. Created on the Vendor groups page and assigned to individual vendor records. Groups simplify bulk configuration for vendors with similar payment terms or posting profiles.',
      },
      {
        term: 'Terms of Payment',
        definition:
          'Rules that determine invoice due dates for purchase orders, sales orders, customers, and vendors. Configured on the Terms of payment page and assigned to vendor records. Examples include Net 30, 2/10 Net 30 (2% discount if paid within 10 days).',
      },
      {
        term: 'Methods of Payment',
        definition:
          'Configuration on the Methods of payment — vendors page that defines how the organization pays vendors. Includes check, electronic funds transfer (EFT), wire, and other payment types. Linked to bank accounts configured in Cash and bank management.',
      },
      {
        term: 'Vendor Invoice Register',
        definition:
          'A fast-entry method for recording vendor invoices that do not reference a purchase order. Invoices entered here accrue the expense immediately. The vendor invoice approval journal is then used to select accrued invoices and post them to the vendor balance, reversing the accrual.',
      },
      {
        term: 'Three-Way Matching',
        definition:
          'An invoice matching policy that validates a vendor invoice against both the purchase order lines and the product receipt lines before allowing payment. Ensures that items ordered, items received, and items invoiced all agree. Used primarily for physical goods and fixed asset purchases.',
      },
      {
        term: 'Two-Way Matching',
        definition:
          'An invoice matching policy that validates a vendor invoice only against the purchase order lines, without requiring a product receipt match. Used for services and non-inventory purchases where a physical receipt is not generated.',
      },
      {
        term: 'Invoice Capture Solution',
        definition:
          'An automated feature in Dynamics 365 Finance that creates vendor invoices directly from digital invoice images (PDF, scanned documents) using optical character recognition and AI extraction, reducing manual data entry.',
      },
      {
        term: 'Pending Vendor Invoices',
        definition:
          'Invoices that have been received but not yet posted to the vendor balance. Accessible from the Open vendor invoices and Pending vendor invoices pages. Used when creating invoices from confirmed purchase orders.',
      },
    ],
    steps: [
      {
        step: 1,
        title: 'Complete General Ledger prerequisites',
        description:
          'Before configuring Accounts Payable, ensure payment journals are set up in General Ledger. If exchange rate adjustments are needed, configure currency codes on the Currencies page, exchange rate types on the Exchange rate types page, and currency exchange rates on the Currency exchange rates page.',
      },
      {
        step: 2,
        title: 'Set up bank accounts in Cash and Bank Management',
        description:
          'Go to Cash and bank management and create the bank accounts your organization uses to pay vendors. Bank accounts are required before you can configure methods of payment for AP.',
      },
      {
        step: 3,
        title: 'Define Terms of Payment',
        description:
          'Go to Accounts payable > Payment setup > Terms of payment. Create payment term records (Net 30, 2/10 Net 30, etc.) that will be assigned to vendor records and purchase orders to determine invoice due dates.',
      },
      {
        step: 4,
        title: 'Configure Methods of Payment for vendors',
        description:
          'Go to Accounts payable > Payment setup > Methods of payment. Create payment method records (check, EFT, wire) and link each to the appropriate bank account. This controls how payment files and check runs are generated.',
      },
      {
        step: 5,
        title: 'Create Vendor Groups',
        description:
          'Go to Accounts payable > Setup > Vendor groups. Create logical groupings for vendors by posting behavior or business segment. Assign a default posting profile to each group so that invoices post to the correct AP liability accounts.',
      },
      {
        step: 6,
        title: 'Create Vendor records',
        description:
          'Go to Accounts payable > Vendors > All vendors. Click New and enter vendor details: name, group, address, tax ID, payment terms, and method of payment. Assign the vendor to the appropriate vendor group created in the previous step.',
      },
      {
        step: 7,
        title: 'Configure Invoice Matching policies',
        description:
          'Go to Accounts payable > Setup > Accounts payable parameters > Invoice validation tab. Set the matching policy at the organization level. For items used as fixed assets, require three-way matching (purchase order + product receipt + invoice). For services, two-way matching is sufficient.',
      },
      {
        step: 8,
        title: 'Enter and post a vendor invoice',
        description:
          'Navigate to Accounts payable > Invoices > Open vendor invoices or Pending vendor invoices. Create an invoice from a confirmed purchase order or enter it manually. Validate that the invoice matches the PO and product receipt per the matching policy, then post to record the AP liability.',
      },
    ],
    faqs: [
      {
        question: 'What is the difference between two-way and three-way invoice matching?',
        answer:
          'Two-way matching validates the vendor invoice against the purchase order lines only — quantities and prices must match the PO. Three-way matching adds an additional validation layer: the invoice must also match the product receipt lines, confirming that the items were physically received before payment is authorized. Three-way matching is recommended for all goods purchases and fixed asset acquisitions to prevent paying for items that were ordered but never received.',
      },
      {
        question: 'What are the different ways to enter a vendor invoice in BC/D365?',
        answer:
          'There are five primary methods: (1) Vendor invoice register — fast entry for non-PO invoices, creates an accrual; (2) Vendor invoice journal — single-step entry for non-PO invoices; (3) Vendor invoice pool — entry for non-PO invoices that will be matched to POs later; (4) Open/Pending vendor invoices pages — for invoices from confirmed purchase orders; (5) Invoice capture solution — automated creation from digital invoice images.',
      },
      {
        question: 'What setup must be completed before Accounts Payable can be configured?',
        answer:
          'Two prerequisite areas must be completed first. In General Ledger: set up payment journals; if using foreign currencies, configure currency codes, exchange rate types, and currency exchange rates. In Cash and bank management: set up bank accounts that will be used with AP methods of payment. Attempting to configure methods of payment in AP before bank accounts exist will result in validation errors.',
      },
    ],
    tips: [
      'Use vendor invoice templates when onboarding multiple vendors with similar configurations — template values are pre-populated on new vendor records, reducing data entry errors.',
      'Enable the Invoice capture solution for high-volume AP environments to reduce manual invoice keying and accelerate the PO-to-payment cycle.',
      'Set invoice matching tolerances (percentage or amount thresholds) to avoid blocking small legitimate price variances — configure these on the Accounts payable parameters > Invoice validation tab.',
    ],
  },

  {
    id: 'accounts-receivable',
    title: 'Accounts Receivable',
    icon: 'ArrowDownCircle',
    category: 'Operations',
    estimatedMinutes: 20,
    overview:
      'Accounts Receivable in Dynamics 365 Finance manages the full customer billing and collections lifecycle. You can create customer invoices from sales orders, packing slips, or as free-text invoices that are not tied to a sales order. The Credit and Collections module extends AR with credit limit controls, blocking rules, and a centralized Collections workspace where collections agents manage overdue accounts and initiate collection activities.',
    concepts: [
      {
        term: 'Customer Posting Profile',
        definition:
          'Configuration that maps customer transactions to the appropriate GL accounts. Controls how customer balances, prepayments, and write-offs are posted to the General Ledger. Assigned at the customer group or individual customer level.',
      },
      {
        term: 'Free Text Invoice',
        definition:
          'A customer invoice created without a sales order or packing slip. Used for one-time charges, recurring fees, or services not tracked through order management. Accounting distributions on free text invoices determine which GL accounts are debited.',
      },
      {
        term: 'Credit Limit',
        definition:
          'The maximum outstanding balance a customer is permitted to carry before new sales orders are blocked or held for review. Credit limits are managed through credit limit adjustments and can be set at the individual customer level or for a customer credit group.',
      },
      {
        term: 'Customer Credit Group',
        definition:
          'A mechanism that links multiple customer accounts together so they share a single combined credit limit. Useful for corporate accounts with multiple subsidiaries — the group-level exposure is monitored rather than each entity in isolation.',
      },
      {
        term: 'Collections Page',
        definition:
          'A centralized workspace in Dynamics 365 Finance where collections managers view and manage accounts receivable collections information. Collections agents access customer lists generated by predefined collection criteria or navigate directly from the Customers page.',
      },
      {
        term: 'Blocking Rules',
        definition:
          'Credit management rules that automatically put a sales order on hold during one or more posting processes based on factors such as risk score, payment terms, credit limit usage percentage, overdue amounts, or outstanding balance thresholds.',
      },
      {
        term: 'Centralized Payments',
        definition:
          'A feature that allows one legal entity to record customer payments on behalf of other legal entities in the organization. Useful for multi-entity organizations with a shared accounts receivable team processing payments centrally.',
      },
      {
        term: 'Risk Score',
        definition:
          'A numeric score assigned to a customer that reflects their credit worthiness. Risk scores can be used to automatically generate credit limits through credit limit adjustments and to trigger blocking rules that hold orders for customers above a threshold.',
      },
    ],
    steps: [
      {
        step: 1,
        title: 'Set up Customer Groups and Posting Profiles',
        description:
          'Go to Accounts receivable > Setup > Customer groups. Create logical groupings for customers. Then go to Accounts receivable > Setup > Customer posting profiles and create posting profiles that map customer balances to the correct AR GL accounts. Assign profiles to customer groups.',
      },
      {
        step: 2,
        title: 'Create Customer records',
        description:
          'Go to Accounts receivable > Customers > All customers. Click New. Enter customer name, group, address, payment terms, and method of payment. Assign the correct posting profile and credit limit at this stage.',
      },
      {
        step: 3,
        title: 'Configure Credit Limits',
        description:
          'On the customer record, set the Credit limit field. For customers that belong to a shared credit group, create a Customer credit group on the Credit management setup page and assign all related customer accounts to the group with a combined limit.',
      },
      {
        step: 4,
        title: 'Set up Blocking Rules',
        description:
          'Go to Credit and collections > Setup > Credit management > Blocking rules. Create rules that define under what conditions a sales order should be held — examples include overdue balance over a threshold, credit limit exceeded by a percentage, or risk score above a limit.',
      },
      {
        step: 5,
        title: 'Create a Customer Invoice from a Sales Order',
        description:
          'After a sales order is confirmed and goods are shipped, go to Accounts receivable > Invoices > Invoice. Select the sales order and generate the invoice. The system validates the customer credit limit and checks active blocking rules before allowing the invoice to post.',
      },
      {
        step: 6,
        title: 'Create a Free Text Invoice',
        description:
          'Go to Accounts receivable > Invoices > All free text invoices. Click New. Enter the customer, invoice date, and add lines with the revenue account and amount. Use accounting distributions to allocate amounts across financial dimensions. Post the invoice to record the AR balance.',
      },
      {
        step: 7,
        title: 'Receive a Customer Payment',
        description:
          'Go to Accounts receivable > Payments > Customer payment journal. Create a new journal line, select the customer, and enter the payment amount and method. Use the Settle transactions function to apply the payment against outstanding invoices. Post the journal to clear the AR balance.',
      },
      {
        step: 8,
        title: 'Manage Collections',
        description:
          'Go to Credit and collections > Collections > Collections. Use the Collections page to view aging information, contact customers, generate collection letters, and log collection activities. Filter the list by collection pool or individual customer to prioritize follow-up.',
      },
    ],
    faqs: [
      {
        question: 'What is the difference between a sales order invoice and a free text invoice?',
        answer:
          'A sales order invoice is generated from a confirmed sales order and packing slip — it references specific items, quantities, and prices from the order. A free text invoice is created independently without a sales order reference, used for services, recurring charges, or one-time billings not tracked through order management. Both result in a debit to AR and a credit to a revenue account, but free text invoices use accounting distributions to manually specify the GL accounts.',
      },
      {
        question: 'How do blocking rules interact with the sales order posting process?',
        answer:
          'Blocking rules are evaluated during one or more sales order posting steps (confirmation, picking, packing slip, or invoice). If a rule condition is met — such as the customer exceeding their credit limit or having an overdue balance above a threshold — the order is automatically placed on hold. Collections managers can then review the hold reasons on the Credit holds page, communicate with the customer, and manually release the order to continue through the posting process.',
      },
      {
        question: 'Can one legal entity collect payments on behalf of another in a multi-entity setup?',
        answer:
          'Yes. The Centralized payments feature allows a single legal entity to record customer payments on behalf of other legal entities. This is configured under Accounts receivable > Setup > Accounts receivable parameters by disabling the Automatic settlement option where applicable, and setting up the intercompany payment relationships. The payment is recorded in the central entity and the appropriate due-to/due-from entries are generated for the other entities.',
      },
    ],
    tips: [
      'Assign risk scores to customers and configure automatic credit limit generation through credit limit adjustments — this reduces manual credit review workload for large customer bases.',
      'Use recurring invoice templates for subscription or retainer billing to automate the periodic creation of free text invoices on a defined schedule.',
      'Configure collection letter sequences with escalating language and interest codes so the system automatically generates the appropriate follow-up documents as invoices age.',
    ],
  },

  {
    id: 'fiscal-calendar',
    title: 'Fiscal Calendar & Periods',
    icon: 'Calendar',
    category: 'Period Close',
    estimatedMinutes: 10,
    overview:
      'Fiscal calendars in Dynamics 365 Finance provide the time framework for all financial activity: posting, budgeting, and fixed asset depreciation. Each fiscal calendar contains one or more fiscal years, and each fiscal year contains multiple periods. Fiscal calendars are independent of the calendar year — they can start on any date — and can be shared across legal entities or kept entity-specific. Period status controls whether transactions can be posted into a given period.',
    concepts: [
      {
        term: 'Fiscal Calendar',
        definition:
          'A named collection of fiscal years and periods that defines the financial reporting structure for one or more legal entities. There is no limit to the number of fiscal calendars that can be created. A single calendar can serve as the ledger calendar, fixed asset calendar, and budget calendar simultaneously.',
      },
      {
        term: 'Fiscal Year',
        definition:
          'A time span within a fiscal calendar, typically 12 months, during which financial performance is measured. Fiscal years can span two calendar years (e.g., July 1 – June 30). Multiple fiscal years can exist within a single fiscal calendar.',
      },
      {
        term: 'Fiscal Period',
        definition:
          'A subdivision of a fiscal year used to control when transactions can be posted. A standard year has 12 periods. Periods have a status of Open, On hold, Closed, or Permanently closed. Only Open periods accept new transactions.',
      },
      {
        term: 'Closing Period',
        definition:
          'A special 13th period created from an existing Open period to hold general ledger closing transactions generated during year-end close. Separating closing entries into their own period makes it easier to produce financial statements that include or exclude year-end adjustments.',
      },
      {
        term: 'Ledger Calendar',
        definition:
          'The assignment of a fiscal calendar to a legal entity on the Ledger page. Each legal entity must have one fiscal calendar assigned as its ledger calendar. Period statuses and user permissions are then managed on the Ledger calendar page.',
      },
      {
        term: 'Budget Cycle Time Span',
        definition:
          'A configuration on the Budget cycle time spans page that defines how many fiscal periods are included in a budget cycle. Budget cycles can span a single fiscal year, multiple years (biennial, triennial), or a partial year.',
      },
    ],
    steps: [
      {
        step: 1,
        title: 'Navigate to Fiscal Calendars',
        description:
          'Go to General ledger > Ledger setup > Fiscal calendars. This page is where you create, view, and manage all fiscal calendars across the organization.',
      },
      {
        step: 2,
        title: 'Create a new Fiscal Calendar',
        description:
          'Click New on the Fiscal calendars page. Enter a calendar name and description. Fiscal calendars are organization-wide and can be shared across legal entities, so use a descriptive name that reflects its scope (e.g., "Calendar FY2026" or "Retail Fiscal Calendar").',
      },
      {
        step: 3,
        title: 'Create a Fiscal Year within the calendar',
        description:
          'With the calendar selected, click Create year. Specify the start date, end date, and the number of periods (typically 12 for monthly). The system generates the period subdivisions automatically based on the start/end dates and period count.',
      },
      {
        step: 4,
        title: 'Review and adjust generated periods',
        description:
          'Review the auto-generated periods. If your organization uses non-standard periods (4-4-5 weeks, 13 four-week periods, etc.), adjust the period start and end dates manually. Each period must be contiguous — no gaps or overlaps allowed.',
      },
      {
        step: 5,
        title: 'Create a Closing Period',
        description:
          'Select the last Open period of the fiscal year (typically Period 12) and click Create closing period. Enter a name for the closing period (e.g., "Close"). Both the original period and the new closing period will share the same date range. Year-end close transactions post into this closing period.',
      },
      {
        step: 6,
        title: 'Assign the calendar to legal entities',
        description:
          'Go to General ledger > Ledger setup > Ledger for each legal entity. In the Fiscal calendar field, select the calendar created above. Once assigned, the legal entity can only post into the periods defined by that calendar.',
      },
      {
        step: 7,
        title: 'Manage Period Statuses on the Ledger Calendar',
        description:
          'Go to General ledger > Ledger setup > Ledger calendar. Select the legal entity and fiscal year. Change period statuses as needed: set periods to On hold to prevent posting during reconciliation, or to Closed after the period has been finalized. Only users with the appropriate permission can post into On hold periods.',
      },
    ],
    faqs: [
      {
        question: 'Can the same fiscal calendar be used for the ledger, fixed assets, and budgeting?',
        answer:
          'Yes. A single fiscal calendar can serve all three purposes simultaneously. On the Ledger page, select it as the legal entity ledger calendar. On a fixed asset book, select it as the fixed asset calendar. On the Budget cycle time spans page, reference it for budget cycles. Using one calendar for all three ensures that periods align across GL, depreciation, and budget reporting.',
      },
      {
        question: 'What is the purpose of a Closing Period and why should it be a separate period?',
        answer:
          'A closing period is a 13th period created from an existing Open period that holds the accounting entries generated during the year-end close process. Separating these entries from the regular Period 12 makes it straightforward to generate financial statements that either include or exclude year-end closing entries. Without a separate closing period, closing entries are intermingled with regular December transactions, complicating comparative reporting.',
      },
      {
        question: 'What happens if I need different fiscal calendars for different departments or legal entities?',
        answer:
          'Each legal entity can be assigned a different fiscal calendar on its Ledger page. There is no limit to the number of fiscal calendars you can create. For example, if five legal entities share a January–December calendar and three use a July–June fiscal year, create two fiscal calendars and assign the appropriate one to each legal entity on the Ledger page.',
      },
    ],
    tips: [
      'Create the closing period before running year-end close — if the closing period does not exist, year-end close entries will post into Period 12 alongside regular transactions.',
      'Set periods to On hold rather than Closed during month-end reconciliation — On hold prevents new postings but allows reversals, while Closed is permanent unless an administrator reopens the period.',
      'Budget cycle time spans can span multiple fiscal years for capital planning — configure biennial or triennial cycles on the Budget cycle time spans page to support multi-year budget comparisons.',
    ],
  },

  {
    id: 'year-end-close',
    title: 'Year-End Close',
    icon: 'CheckSquare',
    category: 'Period Close',
    estimatedMinutes: 25,
    overview:
      'The Year-End Close process in Dynamics 365 Finance transfers net income or loss to retained earnings, generates opening balances for the new fiscal year, and optionally creates detailed opening entries for each unsettled ledger transaction. Beginning in version 10.0.40, the Awareness between ledger settlement and year-end close enhancements ensure that only unsettled transactions are included in the opening balance, preventing settled transactions from being revalued a second time during foreign currency revaluation in the new year.',
    concepts: [
      {
        term: 'Year-End Close Template',
        definition:
          'A configuration setup on the Year-end close template setup page that defines which legal entities and fiscal years are included in the close run. The accounting manager initiates the year-end close from this page, replacing the older direct-run approach.',
      },
      {
        term: 'Enable Advanced Awareness Options',
        definition:
          'A General Ledger parameter (under Ledger settlement settings) that controls whether settled ledger transactions are excluded from the year-end opening balance. Once set to Yes, it is strongly advised not to revert to No, as doing so may impact the period-end close process.',
      },
      {
        term: 'Keep Detail During Year-End Close',
        definition:
          'A main account setting in the ledger settlement setup. When set to Yes, a separate opening balance entry is created for each individual unsettled ledger transaction in the new year, rather than a single summarized opening balance. Enables granular settlement matching in the new fiscal year.',
      },
      {
        term: 'Opening Balance',
        definition:
          'The starting balance for each main account in the new fiscal year, generated by the year-end close process. Balance sheet accounts carry forward their net balance. Profit and loss accounts are zeroed out to retained earnings. Only unsettled transactions are included when Enable advanced awareness options is active.',
      },
      {
        term: 'Ledger Settlement',
        definition:
          'The process of matching debit and credit transactions in the same main account to mark them as settled. Ledger settlement must be performed within a single fiscal year and for transactions within a single main account. Settled transactions are excluded from the year-end opening balance when advanced awareness is enabled.',
      },
      {
        term: 'Reverse Year-End Close',
        definition:
          'A function on the Year-end close page that deletes the accounting entries for the most recent year-end close for a legal entity. The reversal does not automatically rerun the close. A year-end close cannot be reversed if any opening balance transactions have already been settled in the new fiscal year.',
      },
    ],
    steps: [
      {
        step: 1,
        title: 'Complete all period-end reconciliations',
        description:
          'Before initiating year-end close, ensure all subledger reconciliations are complete: AP invoice register entries are approved and posted, AR collections are finalized, bank reconciliations are current, and all open journals are posted or deleted.',
      },
      {
        step: 2,
        title: 'Run foreign currency revaluation',
        description:
          'Go to General ledger > Periodic tasks > Foreign currency revaluation. Run revaluation for all balance sheet accounts held in foreign currencies. This must be completed before year-end close so that the opening balances reflect current exchange rates. AR and AP revaluation should also be run in their respective modules.',
      },
      {
        step: 3,
        title: 'Settle all intra-year ledger transactions',
        description:
          'If Enable advanced awareness options is active, ledger settlement must be done within a fiscal year and within a single main account. Go to General ledger > Periodic tasks > Ledger settlements and settle all matching debit/credit pairs for the closing year before running close. Unsettled cross-year pairs must be unsettled and re-settled within the correct year.',
      },
      {
        step: 4,
        title: 'Enable the closing period',
        description:
          'On the Ledger calendar page, confirm the closing period (Period 13) exists and has a status of Open. Year-end close transactions will post into this closing period. If it does not exist, create it on the Fiscal calendars page before proceeding.',
      },
      {
        step: 5,
        title: 'Navigate to the Year-End Close Template Setup',
        description:
          'Go to General ledger > Period close > Year-end close template setup. Select or create a template that specifies the legal entities and fiscal years to include in the close run. Configure whether to keep detail during year-end close for balance sheet accounts.',
      },
      {
        step: 6,
        title: 'Run the Year-End Close',
        description:
          'From the Year-end close template setup page, select the template and click Run. The process zeroes out profit and loss accounts, posts the net to retained earnings, and creates opening balance entries for balance sheet accounts in the new fiscal year. Monitor the batch job status.',
      },
      {
        step: 7,
        title: 'Validate the opening balances',
        description:
          'After close completes, go to General ledger > Inquiries and reports > Trial balance. Filter for the first period of the new fiscal year and confirm that balance sheet opening balances carry forward correctly and that P&L accounts show zero balances with the net posted to retained earnings.',
      },
      {
        step: 8,
        title: 'Close and lock the prior fiscal year periods',
        description:
          'Go to General ledger > Ledger setup > Ledger calendar. Set all periods in the closed fiscal year to Permanently closed status to prevent inadvertent posting into the prior year. Inform all users that prior-year posting is now locked.',
      },
    ],
    faqs: [
      {
        question: 'Why is the year-end close failing with an "out-of-balance" error?',
        answer:
          'This error occurs when Enable advanced awareness options is active and ledger transactions from the fiscal year being closed are settled against transactions in a different fiscal year. Only unsettled ledger transactions should remain at close time. To resolve: identify the cross-year settled pairs, unsettle them, create adjusting entries in the current year, and resettle within the same fiscal year. If it is not possible to unsettle and resettle before close, disable Enable advanced awareness options until after the close completes, then re-enable it immediately before any new settlements are made in the next year.',
      },
      {
        question: 'Can the year-end close be reversed after it has been run?',
        answer:
          'Yes, but only if no opening balance transactions from the close have been settled in the new fiscal year. Go to the Year-end close page, select the most recent fiscal year for the appropriate legal entity, and click Reverse year-end close. The reversal deletes the prior close accounting entries but does not automatically rerun the close. After reversing, you can make corrections and rerun the close. If the General ledger year-end enhancements feature is enabled, also enable Delete existing year-end close entries when re-closing the year in GL parameters before rerunning.',
      },
      {
        question: 'What happens to profit and loss accounts during year-end close?',
        answer:
          'All profit and loss (income statement) accounts are zeroed out during year-end close. The net balance — net income or net loss — is posted as a credit or debit to the retained earnings account specified in the year-end close template. In the new fiscal year, P&L accounts start at zero and accumulate activity throughout the year. Balance sheet accounts carry forward their closing balances as opening entries in the new year.',
      },
    ],
    tips: [
      'Run year-end close first in a non-production environment and validate the trial balance before running in production — this catches configuration issues without business impact.',
      'Document all cross-year ledger settlement pairs before enabling Enable advanced awareness options — unsettling them after the fact under time pressure causes errors.',
      'Use the Keep detail during year-end close option for main accounts that require granular matching in the new year (e.g., intercompany accounts, large vendor prepayments) — summary opening balances are harder to settle at the transaction level.',
    ],
  },
]
