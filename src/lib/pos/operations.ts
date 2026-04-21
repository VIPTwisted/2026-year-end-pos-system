export interface POSOperation {
  id: number
  name: string
  description: string
  group: 'product' | 'payment' | 'discount' | 'transaction' | 'customer' | 'shift' | 'inventory' | 'device'
  availableOnTransactionScreen: boolean
  availableOnWelcomeScreen: boolean
  availableOffline: boolean
}

export const POS_OPERATIONS: Record<number, POSOperation> = {
  // ─── Product Operations (100–199) ───────────────────────────────────────────
  100: { id: 100, name: 'Product Sale', description: 'Adds a product to the transaction', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: true },
  101: { id: 101, name: 'Price Check', description: 'Looks up the price for a product', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: true },
  102: { id: 102, name: 'Void Line', description: 'Voids the selected line item', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  103: { id: 103, name: 'Return Item', description: 'Processes a return for an item', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  104: { id: 104, name: 'Price Override', description: 'Overrides the price on selected line', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  105: { id: 105, name: 'Set Quantity', description: 'Sets the quantity on selected line', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  106: { id: 106, name: 'Clear Quantity', description: 'Clears the quantity entry', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: true },
  107: { id: 107, name: 'Change Unit of Measure', description: 'Changes the unit of measure for an item', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  108: { id: 108, name: 'Barcode Scan', description: 'Scans a barcode to add item', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: true },
  109: { id: 109, name: 'Manual SKU Entry', description: 'Manually enters a product SKU', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: true },
  110: { id: 110, name: 'Product Search', description: 'Opens product search dialog', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: true },
  111: { id: 111, name: 'Serial Number Entry', description: 'Associates a serial number with item', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  112: { id: 112, name: 'Lot Number Entry', description: 'Associates a lot number with item', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  113: { id: 113, name: 'Weight Entry', description: 'Enters weight for weighed items', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  114: { id: 114, name: 'Item Comment', description: 'Adds a comment to the selected line', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  115: { id: 115, name: 'Mark as Gift', description: 'Marks selected item as a gift', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  116: { id: 116, name: 'Product Details', description: 'Shows product details and inventory', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  117: { id: 117, name: 'Stock Lookup', description: 'Checks stock levels across stores', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  118: { id: 118, name: 'Add Linked Products', description: 'Adds linked or bundled products', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  119: { id: 119, name: 'Void Last Item', description: 'Voids the last item added to cart', group: 'product', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },

  // ─── Payment Operations (200–299) ───────────────────────────────────────────
  200: { id: 200, name: 'Pay Cash', description: 'Processes cash payment', group: 'payment', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  201: { id: 201, name: 'Pay Card', description: 'Processes card payment', group: 'payment', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: false },
  202: { id: 202, name: 'Pay Credit', description: 'Applies customer account credit', group: 'payment', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: false },
  203: { id: 203, name: 'Pay Check', description: 'Processes check payment', group: 'payment', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  204: { id: 204, name: 'Pay Gift Card', description: 'Processes gift card payment', group: 'payment', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: false },
  205: { id: 205, name: 'Split Tender', description: 'Splits payment across multiple methods', group: 'payment', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: false },
  206: { id: 206, name: 'Change Due', description: 'Calculates and displays change', group: 'payment', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  207: { id: 207, name: 'Exact Change', description: 'Marks exact change tendered', group: 'payment', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  208: { id: 208, name: 'Pay Loyalty Points', description: 'Redeems loyalty points as payment', group: 'payment', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: false },
  209: { id: 209, name: 'Refund to Card', description: 'Refunds to original card', group: 'payment', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: false },
  210: { id: 210, name: 'Refund to Cash', description: 'Refunds as cash', group: 'payment', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  211: { id: 211, name: 'Refund to Store Credit', description: 'Refunds as store credit', group: 'payment', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: false },
  212: { id: 212, name: 'Cash Out', description: 'Dispenses cash from drawer', group: 'payment', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  213: { id: 213, name: 'Cash In', description: 'Adds cash to drawer', group: 'payment', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  214: { id: 214, name: 'Safe Drop', description: 'Records safe drop from drawer', group: 'payment', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  215: { id: 215, name: 'Tender Declaration', description: 'Declares cash in drawer', group: 'payment', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  216: { id: 216, name: 'Pay ACH', description: 'Processes ACH/bank transfer payment', group: 'payment', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: false },

  // ─── Discount Operations (300–399) ──────────────────────────────────────────
  300: { id: 300, name: 'Line Discount %', description: 'Applies a percentage discount to selected line', group: 'discount', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  301: { id: 301, name: 'Line Discount $', description: 'Applies a fixed amount discount to selected line', group: 'discount', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  302: { id: 302, name: 'Total Discount %', description: 'Applies a percentage discount to the total', group: 'discount', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  303: { id: 303, name: 'Total Discount $', description: 'Applies a fixed amount discount to the total', group: 'discount', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  304: { id: 304, name: 'Remove Line Discount', description: 'Removes discount from selected line', group: 'discount', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  305: { id: 305, name: 'Remove Total Discount', description: 'Removes the transaction-level discount', group: 'discount', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  306: { id: 306, name: 'Employee Discount', description: 'Applies employee discount to transaction', group: 'discount', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  307: { id: 307, name: 'Military Discount', description: 'Applies military/veteran discount', group: 'discount', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  308: { id: 308, name: 'Senior Discount', description: 'Applies senior citizen discount', group: 'discount', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  309: { id: 309, name: 'Apply Coupon', description: 'Applies a coupon code', group: 'discount', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: false },
  310: { id: 310, name: 'Apply Promo Code', description: 'Applies a promotional price code', group: 'discount', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: false },
  311: { id: 311, name: 'Mix & Match Discount', description: 'Applies mix and match pricing', group: 'discount', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  312: { id: 312, name: 'Quantity Discount', description: 'Applies quantity-based discount tiers', group: 'discount', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  313: { id: 313, name: 'Manager Override Discount', description: 'Manager-authorized discount override', group: 'discount', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  314: { id: 314, name: 'Loyalty Discount', description: 'Applies loyalty tier discount', group: 'discount', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: false },

  // ─── Transaction Operations (500–599) ───────────────────────────────────────
  500: { id: 500, name: 'Void Transaction', description: 'Voids the entire current transaction', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  501: { id: 501, name: 'New Transaction', description: 'Starts a new blank transaction', group: 'transaction', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  502: { id: 502, name: 'Save Transaction', description: 'Saves transaction without completing', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  503: { id: 503, name: 'Suspend Transaction', description: 'Suspends transaction to localStorage', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  504: { id: 504, name: 'Recall Transaction', description: 'Recalls a suspended transaction', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: true },
  505: { id: 505, name: 'Add Transaction Comment', description: 'Adds a comment to the transaction', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  506: { id: 506, name: 'Transaction Tax Override', description: 'Overrides tax rate on transaction', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  507: { id: 507, name: 'Tax Exempt', description: 'Marks transaction as tax exempt', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  508: { id: 508, name: 'Change Transaction Type', description: 'Changes between sale / return / exchange', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  509: { id: 509, name: 'Print Receipt', description: 'Prints the transaction receipt', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  510: { id: 510, name: 'Email Receipt', description: 'Emails the receipt to customer', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: false },
  511: { id: 511, name: 'Reprint Last Receipt', description: 'Reprints the last completed transaction receipt', group: 'transaction', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  512: { id: 512, name: 'Issue Gift Card', description: 'Issues a new gift card', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  513: { id: 513, name: 'Reload Gift Card', description: 'Adds funds to an existing gift card', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  514: { id: 514, name: 'Gift Card Balance', description: 'Checks gift card balance', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  515: { id: 515, name: 'Recall Order', description: 'Recalls a previous order for return/exchange', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  516: { id: 516, name: 'Ship Items', description: 'Marks items for shipment', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: false },
  517: { id: 517, name: 'Layaway', description: 'Sets up a layaway plan', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: false },
  518: { id: 518, name: 'Pick Up In Store', description: 'Processes BOPIS pickup', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  519: { id: 519, name: 'Sales Order', description: 'Creates a future sales order', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  520: { id: 520, name: 'Quote', description: 'Creates a sales quote', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  521: { id: 521, name: 'Loyalty Points Balance', description: 'Checks customer loyalty points balance', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  522: { id: 522, name: 'Add Loyalty Card', description: 'Associates loyalty card with transaction', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: false },
  523: { id: 523, name: 'Open Order', description: 'Opens a saved sales order', group: 'transaction', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  524: { id: 524, name: 'Transaction History', description: 'Shows list of recent transactions', group: 'transaction', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },

  // ─── Customer Operations (600–699) ──────────────────────────────────────────
  600: { id: 600, name: 'Customer Attach', description: 'Attaches a customer to the transaction', group: 'customer', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  601: { id: 601, name: 'Customer Lookup', description: 'Searches for a customer record', group: 'customer', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  602: { id: 602, name: 'New Customer', description: 'Creates a new customer record', group: 'customer', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  603: { id: 603, name: 'Customer Clear', description: 'Removes customer from transaction', group: 'customer', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  604: { id: 604, name: 'View Customer', description: 'Opens customer account details', group: 'customer', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  605: { id: 605, name: 'Edit Customer', description: 'Edits customer profile', group: 'customer', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  606: { id: 606, name: 'Customer Purchase History', description: 'Shows customer transaction history', group: 'customer', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  607: { id: 607, name: 'Issue Loyalty Card', description: 'Issues a new loyalty card to customer', group: 'customer', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  608: { id: 608, name: 'Loyalty Points Adjustment', description: 'Manually adjusts loyalty points balance', group: 'customer', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  609: { id: 609, name: 'Customer Credit', description: 'Issues store credit to customer', group: 'customer', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  610: { id: 610, name: 'Customer Credit Check', description: 'Checks customer credit balance', group: 'customer', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  611: { id: 611, name: 'Charge on Account', description: 'Charges transaction to customer account', group: 'customer', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: false },
  612: { id: 612, name: 'Add to Customer Notes', description: 'Adds note to customer record', group: 'customer', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: false },
  613: { id: 613, name: 'Customer Segment', description: 'Adds customer to a segment/tag', group: 'customer', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },

  // ─── Shift Operations (700–799) ─────────────────────────────────────────────
  700: { id: 700, name: 'Open Shift', description: 'Opens the cashier shift with start amount', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  701: { id: 701, name: 'Close Shift', description: 'Closes the shift and prints Z report', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  702: { id: 702, name: 'X Report', description: 'Prints mid-day X report without closing', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  703: { id: 703, name: 'Z Report', description: 'Prints end-of-day Z report on close', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  704: { id: 704, name: 'Logon', description: 'Logs on a cashier/operator', group: 'shift', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: true },
  705: { id: 705, name: 'Logoff', description: 'Logs off the current cashier', group: 'shift', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: true },
  706: { id: 706, name: 'Lock Terminal', description: 'Locks the terminal requiring PIN', group: 'shift', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: true },
  707: { id: 707, name: 'Manager Override', description: 'Triggers manager approval prompt', group: 'shift', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: true },
  708: { id: 708, name: 'Drawer Open', description: 'Opens the cash drawer without sale', group: 'shift', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: true },
  709: { id: 709, name: 'Float Entry', description: 'Records opening float amount', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  710: { id: 710, name: 'Remove Float', description: 'Records removal of float', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  711: { id: 711, name: 'Cash Count', description: 'Performs cash count reconciliation', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  712: { id: 712, name: 'Transfer Shift', description: 'Transfers shift to another cashier', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  713: { id: 713, name: 'View Shift Report', description: 'Displays current shift summary', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },

  // ─── Inventory Operations (1000–1099) ───────────────────────────────────────
  1000: { id: 1000, name: 'Stock Count', description: 'Initiates a stock count on device', group: 'inventory', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  1001: { id: 1001, name: 'Inventory Adjustment', description: 'Records an inventory adjustment', group: 'inventory', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  1002: { id: 1002, name: 'Receive Stock', description: 'Records received stock from PO', group: 'inventory', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  1003: { id: 1003, name: 'Transfer Out', description: 'Transfers stock to another store', group: 'inventory', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  1004: { id: 1004, name: 'Transfer In', description: 'Receives stock transferred from another store', group: 'inventory', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  1005: { id: 1005, name: 'Bin Movement', description: 'Moves item between warehouse bins', group: 'inventory', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  1006: { id: 1006, name: 'Print Barcode Labels', description: 'Prints barcode labels for products', group: 'inventory', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  1007: { id: 1007, name: 'Print Price Tags', description: 'Prints shelf price tags', group: 'inventory', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  1008: { id: 1008, name: 'Low Stock Report', description: 'Shows items at or below reorder point', group: 'inventory', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  1009: { id: 1009, name: 'Write Off', description: 'Writes off damaged or shrinkage inventory', group: 'inventory', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  1010: { id: 1010, name: 'Reserve Stock', description: 'Reserves stock for an order', group: 'inventory', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: false },

  // ─── Device Operations (1200–1299) ──────────────────────────────────────────
  1200: { id: 1200, name: 'Print Test', description: 'Prints a test receipt', group: 'device', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  1201: { id: 1201, name: 'Open Drawer', description: 'Opens cash drawer via device command', group: 'device', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  1202: { id: 1202, name: 'Display Settings', description: 'Opens display/brightness settings', group: 'device', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  1203: { id: 1203, name: 'Printer Settings', description: 'Opens receipt printer configuration', group: 'device', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  1204: { id: 1204, name: 'Payment Terminal Settings', description: 'Opens card reader configuration', group: 'device', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  1205: { id: 1205, name: 'Scale Settings', description: 'Configures connected scale', group: 'device', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  1206: { id: 1206, name: 'Barcode Scanner Settings', description: 'Configures barcode scanner', group: 'device', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  1207: { id: 1207, name: 'Sync Now', description: 'Forces an immediate data sync', group: 'device', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  1208: { id: 1208, name: 'Offline Mode', description: 'Toggles offline / online mode', group: 'device', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  1209: { id: 1209, name: 'Restart POS', description: 'Restarts the POS application', group: 'device', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  1210: { id: 1210, name: 'Network Diagnostics', description: 'Runs network connectivity check', group: 'device', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  1211: { id: 1211, name: 'Display Customer Facing Screen', description: 'Toggles customer-facing display', group: 'device', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: true },
  1212: { id: 1212, name: 'Clear Screen', description: 'Clears screen to welcome screen', group: 'device', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: true },

  // ─── Operations (1300–1399) ──────────────────────────────────────────────────
  1300: { id: 1300, name: 'End of Day Report', description: 'Generates full end-of-day report', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  1301: { id: 1301, name: 'Sales Report', description: 'Shows sales summary for current shift', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  1302: { id: 1302, name: 'Hourly Sales', description: 'Shows hourly sales breakdown', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  1303: { id: 1303, name: 'Top Products', description: 'Shows top-selling products for shift', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  1304: { id: 1304, name: 'Cashier Report', description: 'Shows report for specific cashier', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  1305: { id: 1305, name: 'Void Report', description: 'Shows list of voided transactions', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  1306: { id: 1306, name: 'Discount Report', description: 'Shows all discounts applied in shift', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  1307: { id: 1307, name: 'Payment Method Report', description: 'Breakdown of sales by tender type', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },

  // ─── Manager / Admin Operations (1400–1499) ──────────────────────────────────
  1400: { id: 1400, name: 'Override Price', description: 'Manager override for price changes', group: 'transaction', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  1401: { id: 1401, name: 'Override Discount', description: 'Manager override for discount limits', group: 'discount', availableOnTransactionScreen: true, availableOnWelcomeScreen: false, availableOffline: true },
  1402: { id: 1402, name: 'Void After Close', description: 'Manager-authorized post-close void', group: 'transaction', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  1403: { id: 1403, name: 'Edit Posted Transaction', description: 'Manager correction on posted transaction', group: 'transaction', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  1404: { id: 1404, name: 'Unlock Terminal', description: 'Manager unlock of locked terminal', group: 'shift', availableOnTransactionScreen: true, availableOnWelcomeScreen: true, availableOffline: true },
  1405: { id: 1405, name: 'Change Password', description: 'Changes cashier PIN/password', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: true },
  1406: { id: 1406, name: 'Manage Users', description: 'Opens user management screen', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
  1407: { id: 1407, name: 'Store Settings', description: 'Opens store configuration settings', group: 'shift', availableOnTransactionScreen: false, availableOnWelcomeScreen: true, availableOffline: false },
}

export const OPERATION_GROUPS = [
  'product', 'payment', 'discount', 'transaction', 'customer', 'shift', 'inventory', 'device',
] as const

export type OperationGroup = typeof OPERATION_GROUPS[number]

export function getOperationsByGroup(group: OperationGroup): POSOperation[] {
  return Object.values(POS_OPERATIONS).filter(op => op.group === group)
}

export function getOperation(id: number): POSOperation | undefined {
  return POS_OPERATIONS[id]
}
