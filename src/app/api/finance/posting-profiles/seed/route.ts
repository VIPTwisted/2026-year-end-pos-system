import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** Look up account by code; fall back to the first account of the given type. */
async function resolveAccount(code: string, type: string): Promise<string | null> {
  const byCode = await prisma.account.findUnique({ where: { code } })
  if (byCode) return byCode.id

  const byType = await prisma.account.findFirst({
    where: { type, isActive: true },
    orderBy: { code: 'asc' },
  })
  return byType?.id ?? null
}

export async function POST() {
  try {
    const existingCount = await prisma.postingProfile.count()
    if (existingCount > 0) {
      return NextResponse.json({
        message: `Skipped — ${existingCount} profile(s) already exist.`,
        seeded: false,
      })
    }

    // Resolve standard account IDs
    const [
      expense5000,
      liability2000,
      asset1010,
      asset1200,
      revenue4000,
    ] = await Promise.all([
      resolveAccount('5000', 'expense'),
      resolveAccount('2000', 'liability'),
      resolveAccount('1010', 'asset'),
      resolveAccount('1200', 'asset'),
      resolveAccount('4000', 'revenue'),
    ])

    const profiles = await prisma.$transaction(async (tx) => {
      // AP Standard
      const apProfile = await tx.postingProfile.create({
        data: {
          code: 'AP-STD',
          name: 'AP Standard',
          module: 'AP',
          description: 'Standard accounts payable posting: vendor invoices and payments.',
          isDefault: true,
          rules: {
            create: [
              {
                transactionType: 'VendorInvoice',
                debitAccountId: expense5000,
                creditAccountId: liability2000,
                applicableTo: 'ALL',
              },
              {
                transactionType: 'VendorPayment',
                debitAccountId: liability2000,
                creditAccountId: asset1010,
                applicableTo: 'ALL',
              },
            ],
          },
        },
        include: { rules: { include: { debitAccount: true, creditAccount: true } } },
      })

      // AR Standard
      const arProfile = await tx.postingProfile.create({
        data: {
          code: 'AR-STD',
          name: 'AR Standard',
          module: 'AR',
          description: 'Standard accounts receivable posting: customer invoices and payments.',
          isDefault: true,
          rules: {
            create: [
              {
                transactionType: 'CustomerInvoice',
                debitAccountId: asset1200,
                creditAccountId: revenue4000,
                applicableTo: 'ALL',
              },
              {
                transactionType: 'CustomerPayment',
                debitAccountId: asset1010,
                creditAccountId: asset1200,
                applicableTo: 'ALL',
              },
            ],
          },
        },
        include: { rules: { include: { debitAccount: true, creditAccount: true } } },
      })

      // INVENTORY Standard
      const invProfile = await tx.postingProfile.create({
        data: {
          code: 'INV-STD',
          name: 'Inventory Standard',
          module: 'INVENTORY',
          description: 'Standard inventory posting for receipts, adjustments, and shipments.',
          isDefault: true,
          rules: {
            create: [
              {
                transactionType: 'PurchaseReceipt',
                debitAccountId: asset1200,  // Inventory asset
                creditAccountId: liability2000,
                applicableTo: 'ALL',
              },
              {
                transactionType: 'SalesShipment',
                debitAccountId: expense5000,
                creditAccountId: asset1200,
                applicableTo: 'ALL',
              },
              {
                transactionType: 'PositiveAdjustment',
                debitAccountId: asset1200,
                creditAccountId: expense5000,
                applicableTo: 'ALL',
              },
              {
                transactionType: 'NegativeAdjustment',
                debitAccountId: expense5000,
                creditAccountId: asset1200,
                applicableTo: 'ALL',
              },
            ],
          },
        },
        include: { rules: { include: { debitAccount: true, creditAccount: true } } },
      })

      // BANK Standard
      const bankProfile = await tx.postingProfile.create({
        data: {
          code: 'BANK-STD',
          name: 'Bank Standard',
          module: 'BANK',
          description: 'Standard bank posting for deposits, withdrawals, and fees.',
          isDefault: true,
          rules: {
            create: [
              {
                transactionType: 'BankDeposit',
                debitAccountId: asset1010,
                creditAccountId: revenue4000,
                applicableTo: 'ALL',
              },
              {
                transactionType: 'BankWithdrawal',
                debitAccountId: expense5000,
                creditAccountId: asset1010,
                applicableTo: 'ALL',
              },
              {
                transactionType: 'BankFee',
                debitAccountId: expense5000,
                creditAccountId: asset1010,
                applicableTo: 'ALL',
              },
            ],
          },
        },
        include: { rules: { include: { debitAccount: true, creditAccount: true } } },
      })

      // PAYROLL Standard
      const payrollProfile = await tx.postingProfile.create({
        data: {
          code: 'PAY-STD',
          name: 'Payroll Standard',
          module: 'PAYROLL',
          description: 'Standard payroll posting for wages, taxes, and net pay.',
          isDefault: true,
          rules: {
            create: [
              {
                transactionType: 'PayrollWages',
                debitAccountId: expense5000,
                creditAccountId: liability2000,
                applicableTo: 'ALL',
              },
              {
                transactionType: 'PayrollTax',
                debitAccountId: liability2000,
                creditAccountId: asset1010,
                applicableTo: 'ALL',
              },
              {
                transactionType: 'PayrollNetPay',
                debitAccountId: liability2000,
                creditAccountId: asset1010,
                applicableTo: 'ALL',
              },
            ],
          },
        },
        include: { rules: { include: { debitAccount: true, creditAccount: true } } },
      })

      return [apProfile, arProfile, invProfile, bankProfile, payrollProfile]
    })

    return NextResponse.json({
      message: `Seeded ${profiles.length} default posting profiles.`,
      seeded: true,
      profiles,
    }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/finance/posting-profiles/seed]', err)
    return NextResponse.json({ error: 'Failed to seed posting profiles' }, { status: 500 })
  }
}
