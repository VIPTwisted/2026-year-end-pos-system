const { PrismaLibSql } = require('@prisma/adapter-libsql')
const { PrismaClient } = require('@prisma/client')

const adapter = new PrismaLibSql({ url: 'file:prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const store = await prisma.store.findFirst()
  if (!store) { console.log('No store found'); return }

  // Hardware Profile
  const hw = await prisma.hardwareProfile.upsert({
    where: { id: 'default-hw' },
    create: {
      id: 'default-hw',
      name: 'Standard Register',
      printerType: 'epson',
      cashDrawerPort: 'printer',
      paymentTerminalType: 'none',
      barcodeScanner: 'usb',
    },
    update: {},
  })

  // Functionality Profile
  const fp = await prisma.functionalityProfile.upsert({
    where: { id: 'default-fp' },
    create: {
      id: 'default-fp',
      name: 'Standard Store',
      voidRequiresManager: true,
      splitTenderAllowed: true,
      loyaltyAllowed: true,
      giftCardAllowed: true,
      manualDiscountAllowed: true,
    },
    update: {},
  })

  // Receipt Profile
  const rp = await prisma.receiptProfile.upsert({
    where: { id: 'default-rp' },
    create: {
      id: 'default-rp',
      name: 'Standard Receipt',
      footerLine1: 'Thank you for shopping with us!',
      footerLine2: 'Returns accepted within 30 days with receipt.',
      showLoyaltyBalance: true,
      isDefault: true,
    },
    update: {},
  })

  // POS Registers
  for (let i = 1; i <= 3; i++) {
    await prisma.posRegister.upsert({
      where: { registerId: `REG-0${i}` },
      create: {
        registerId: `REG-0${i}`,
        name: `Register ${i}`,
        storeId: store.id,
        hardwareProfileId: hw.id,
        functionalityProfileId: fp.id,
        receiptProfileId: rp.id,
      },
      update: {},
    })
  }

  // Payment Methods
  const methods = [
    { method: 'cash', displayName: 'Cash', allowChange: true, allowOverTender: true, sortOrder: 1 },
    { method: 'visa', displayName: 'VISA', sortOrder: 2, requireSignature: true, signatureThreshold: 25 },
    { method: 'mastercard', displayName: 'MASTERCARD', sortOrder: 3, requireSignature: true, signatureThreshold: 25 },
    { method: 'amex', displayName: 'AMEX', sortOrder: 4 },
    { method: 'debit', displayName: 'DEBIT', sortOrder: 5 },
    { method: 'gift-card', displayName: 'GIFT CARD', sortOrder: 6 },
    { method: 'store-credit', displayName: 'STORE CREDIT', sortOrder: 7 },
    { method: 'loyalty', displayName: 'LOYALTY REWARDS', sortOrder: 8 },
  ]
  for (const m of methods) {
    const existing = await prisma.storePaymentMethod.findFirst({
      where: { storeId: store.id, method: m.method },
    })
    if (!existing) {
      await prisma.storePaymentMethod.create({
        data: { storeId: store.id, isActive: true, allowChange: false, allowOverTender: false, requireSignature: false, ...m },
      })
    }
  }

  console.log('POS configuration seeded successfully')
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
