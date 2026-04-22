import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const OPERATIONS = [
  // Cash & Drawer
  { operationId: 100, operationName: 'Cash declaration', category: 'Cash & Drawer', requiresManager: false, description: 'Declare cash in drawer at start of shift' },
  { operationId: 101, operationName: 'Tender removal', category: 'Cash & Drawer', requiresManager: true, description: 'Remove tender from drawer mid-shift' },
  { operationId: 102, operationName: 'Float entry', category: 'Cash & Drawer', requiresManager: false, description: 'Enter opening float amount' },
  { operationId: 103, operationName: 'Safe drop', category: 'Cash & Drawer', requiresManager: true, description: 'Drop excess cash to safe' },
  { operationId: 104, operationName: 'Bank drop', category: 'Cash & Drawer', requiresManager: true, description: 'Drop cash to bank deposit' },
  { operationId: 105, operationName: 'Open drawer', category: 'Cash & Drawer', requiresManager: false, description: 'Manually open cash drawer' },
  { operationId: 106, operationName: 'Blind close shift', category: 'Cash & Drawer', requiresManager: true, description: 'Close shift without viewing totals' },
  { operationId: 107, operationName: 'Open shift', category: 'Cash & Drawer', requiresManager: false, description: 'Open a new POS shift' },
  { operationId: 108, operationName: 'Close shift', category: 'Cash & Drawer', requiresManager: true, description: 'Close current POS shift' },
  { operationId: 109, operationName: 'Print X report', category: 'Cash & Drawer', requiresManager: true, description: 'Print X (mid-day) report' },
  { operationId: 110, operationName: 'Print Z report', category: 'Cash & Drawer', requiresManager: true, description: 'Print Z (end-of-day) report' },
  // Payments
  { operationId: 200, operationName: 'Pay cash', category: 'Payments', requiresManager: false, description: 'Accept cash payment' },
  { operationId: 201, operationName: 'Pay card', category: 'Payments', requiresManager: false, description: 'Accept card payment' },
  { operationId: 202, operationName: 'Pay check', category: 'Payments', requiresManager: false, description: 'Accept check payment' },
  { operationId: 203, operationName: 'Pay currency', category: 'Payments', requiresManager: false, description: 'Accept foreign currency payment' },
  { operationId: 204, operationName: 'Pay customer account', category: 'Payments', requiresManager: false, description: 'Charge to customer account' },
  { operationId: 205, operationName: 'Pay gift card', category: 'Payments', requiresManager: false, description: 'Accept gift card payment' },
  { operationId: 206, operationName: 'Pay loyalty card', category: 'Payments', requiresManager: false, description: 'Redeem loyalty points for payment' },
  { operationId: 207, operationName: 'Change payment', category: 'Payments', requiresManager: true, description: 'Change payment method on a transaction' },
  { operationId: 208, operationName: 'Void payment', category: 'Payments', requiresManager: true, description: 'Void an existing payment line' },
  { operationId: 209, operationName: 'Issue gift card', category: 'Payments', requiresManager: false, description: 'Issue a new gift card' },
  { operationId: 210, operationName: 'Add to gift card', category: 'Payments', requiresManager: false, description: 'Add balance to existing gift card' },
  { operationId: 211, operationName: 'Gift card balance inquiry', category: 'Payments', requiresManager: false, description: 'Check gift card balance' },
  // Customer
  { operationId: 300, operationName: 'Add customer', category: 'Customer', requiresManager: false, description: 'Add customer to transaction' },
  { operationId: 301, operationName: 'Clear customer', category: 'Customer', requiresManager: false, description: 'Remove customer from transaction' },
  { operationId: 302, operationName: 'Customer account deposit', category: 'Customer', requiresManager: false, description: 'Make deposit to customer account' },
  { operationId: 303, operationName: 'Customer order', category: 'Customer', requiresManager: false, description: 'Create new customer order' },
  { operationId: 304, operationName: 'Recall customer order', category: 'Customer', requiresManager: false, description: 'Retrieve existing customer order' },
  { operationId: 305, operationName: 'Cancel customer order', category: 'Customer', requiresManager: true, description: 'Cancel an existing customer order' },
  { operationId: 306, operationName: 'Edit customer', category: 'Customer', requiresManager: false, description: 'Edit customer details' },
  { operationId: 307, operationName: 'Search customers', category: 'Customer', requiresManager: false, description: 'Search customer database' },
  { operationId: 308, operationName: 'Customer transaction', category: 'Customer', requiresManager: false, description: 'View customer transaction history' },
  // Inventory
  { operationId: 400, operationName: 'Price check', category: 'Inventory', requiresManager: false, description: 'Check product price' },
  { operationId: 401, operationName: 'Inventory lookup', category: 'Inventory', requiresManager: false, description: 'Look up inventory levels' },
  { operationId: 402, operationName: 'Stock count', category: 'Inventory', requiresManager: true, description: 'Perform physical stock count' },
  { operationId: 403, operationName: 'Inbound operation', category: 'Inventory', requiresManager: false, description: 'Receive inbound inventory' },
  { operationId: 404, operationName: 'Outbound operation', category: 'Inventory', requiresManager: false, description: 'Process outbound inventory' },
  { operationId: 405, operationName: 'Product details', category: 'Inventory', requiresManager: false, description: 'View product details' },
  { operationId: 406, operationName: 'Serial number', category: 'Inventory', requiresManager: false, description: 'Manage product serial numbers' },
  { operationId: 407, operationName: 'Picking and receiving', category: 'Inventory', requiresManager: false, description: 'Pick and receive inventory' },
  { operationId: 408, operationName: 'Transfer order', category: 'Inventory', requiresManager: true, description: 'Create inventory transfer order' },
  // Discounts
  { operationId: 500, operationName: 'Line discount amount', category: 'Discounts', requiresManager: true, description: 'Apply fixed amount discount to line' },
  { operationId: 501, operationName: 'Line discount percent', category: 'Discounts', requiresManager: true, description: 'Apply percentage discount to line' },
  { operationId: 502, operationName: 'Total discount amount', category: 'Discounts', requiresManager: true, description: 'Apply fixed amount discount to total' },
  { operationId: 503, operationName: 'Total discount percent', category: 'Discounts', requiresManager: true, description: 'Apply percentage discount to total' },
  { operationId: 504, operationName: 'Price override', category: 'Discounts', requiresManager: true, description: 'Override price on a line item' },
  { operationId: 505, operationName: 'Clear discount', category: 'Discounts', requiresManager: false, description: 'Remove applied discount' },
  { operationId: 506, operationName: 'Coupon code', category: 'Discounts', requiresManager: false, description: 'Apply coupon code discount' },
  // Returns
  { operationId: 600, operationName: 'Return product', category: 'Returns', requiresManager: false, description: 'Process individual product return' },
  { operationId: 601, operationName: 'Return transaction', category: 'Returns', requiresManager: false, description: 'Return entire transaction' },
  { operationId: 602, operationName: 'Void transaction', category: 'Returns', requiresManager: true, description: 'Void entire transaction' },
  { operationId: 603, operationName: 'Void item', category: 'Returns', requiresManager: true, description: 'Void single line item' },
  { operationId: 604, operationName: 'Void quantity', category: 'Returns', requiresManager: true, description: 'Void partial quantity on a line' },
  { operationId: 605, operationName: 'Return to store credit', category: 'Returns', requiresManager: true, description: 'Issue store credit for return' },
  // Manager
  { operationId: 700, operationName: 'Manager override', category: 'Manager', requiresManager: true, description: 'Perform manager override action' },
  { operationId: 701, operationName: 'Edit receipt', category: 'Manager', requiresManager: true, description: 'Edit receipt before printing' },
  { operationId: 702, operationName: 'Reprint receipt', category: 'Manager', requiresManager: false, description: 'Reprint previous receipt' },
  { operationId: 703, operationName: 'Print receipt', category: 'Manager', requiresManager: false, description: 'Print current transaction receipt' },
  { operationId: 704, operationName: 'Email receipt', category: 'Manager', requiresManager: false, description: 'Email receipt to customer' },
  { operationId: 705, operationName: 'Suspend transaction', category: 'Manager', requiresManager: false, description: 'Suspend current transaction' },
  { operationId: 706, operationName: 'Recall transaction', category: 'Manager', requiresManager: false, description: 'Recall a suspended transaction' },
  { operationId: 707, operationName: 'Transaction journal', category: 'Manager', requiresManager: true, description: 'View transaction journal' },
  { operationId: 708, operationName: 'Show journal', category: 'Manager', requiresManager: false, description: 'Show current shift journal' },
  { operationId: 709, operationName: 'Lock terminal', category: 'Manager', requiresManager: false, description: 'Lock POS terminal' },
  { operationId: 710, operationName: 'Logoff', category: 'Manager', requiresManager: false, description: 'Log off current user' },
  { operationId: 711, operationName: 'Change user', category: 'Manager', requiresManager: false, description: 'Switch to different user' },
  { operationId: 712, operationName: 'Password change', category: 'Manager', requiresManager: false, description: 'Change user password' },
  // Other
  { operationId: 800, operationName: 'Training mode', category: 'Other', requiresManager: true, description: 'Enable training mode for new staff' },
  { operationId: 801, operationName: 'Set quantity', category: 'Other', requiresManager: false, description: 'Set item quantity on transaction' },
  { operationId: 802, operationName: 'Set unit of measure', category: 'Other', requiresManager: false, description: 'Set unit of measure for item' },
  { operationId: 803, operationName: 'Weight product', category: 'Other', requiresManager: false, description: 'Weigh product at scale' },
  { operationId: 804, operationName: 'Sales order', category: 'Other', requiresManager: false, description: 'Create sales order from POS' },
  { operationId: 805, operationName: 'Add to order', category: 'Other', requiresManager: false, description: 'Add items to existing order' },
  { operationId: 806, operationName: 'Minimize', category: 'Other', requiresManager: false, description: 'Minimize POS application' },
  { operationId: 807, operationName: 'Health check', category: 'Other', requiresManager: true, description: 'Run POS system health check' },
  { operationId: 808, operationName: 'Time clock', category: 'Other', requiresManager: false, description: 'Clock in/out time tracking' },
]

export async function POST() {
  try {
    const results = await Promise.all(
      OPERATIONS.map((op) =>
        prisma.pOSOperation.upsert({
          where: { operationId: op.operationId },
          update: {
            operationName: op.operationName,
            description: op.description,
            category: op.category,
            requiresManager: op.requiresManager,
          },
          create: {
            operationId: op.operationId,
            operationName: op.operationName,
            description: op.description ?? null,
            category: op.category,
            requiresManager: op.requiresManager,
            allowWithoutDrawer: false,
            isActive: true,
            isBuiltIn: true,
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      seeded: results.length,
      message: `Successfully seeded ${results.length} POS operations`,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed POS operations' },
      { status: 500 }
    )
  }
}
