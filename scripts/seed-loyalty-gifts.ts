import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const adapter = new PrismaLibSql({ url: 'file:prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  console.log('\n=== seed-loyalty-gifts.ts starting ===\n')

  // ─── Loyalty Programs (3) ─────────────────────────────────────────────────
  const goldProgram = await prisma.loyaltyProgram.upsert({
    where: { id: 'prog-gold' },
    update: {},
    create: {
      id: 'prog-gold',
      name: 'Gold Rewards',
      description: 'Earn 1 point per dollar spent. Redeem at $0.01/point.',
      status: 'active',
    },
  })

  const silverProgram = await prisma.loyaltyProgram.upsert({
    where: { id: 'prog-silver' },
    update: {},
    create: {
      id: 'prog-silver',
      name: 'Silver Rewards',
      description: 'Earn 0.5 points per dollar spent. Redeem at $0.01/point.',
      status: 'active',
    },
  })

  const platinumProgram = await prisma.loyaltyProgram.upsert({
    where: { id: 'prog-platinum' },
    update: {},
    create: {
      id: 'prog-platinum',
      name: 'Platinum Rewards',
      description: 'Earn 2 points per dollar spent. Redeem at $0.02/point.',
      status: 'active',
    },
  })

  const programs = [goldProgram, silverProgram, platinumProgram]
  console.log(`Loyalty Programs seeded: ${programs.map(p => p.name).join(', ')}`)

  // ─── Loyalty Tiers (one per program) ────────────────────────────────────
  const goldTier = await prisma.loyaltyTier.upsert({
    where: { id: 'tier-gold' },
    update: {},
    create: {
      id: 'tier-gold',
      name: 'Gold',
      minPoints: 500,
      multiplier: 1.0,
      colorHex: '#f59e0b',
      sortOrder: 2,
    },
  })

  const silverTier = await prisma.loyaltyTier.upsert({
    where: { id: 'tier-silver' },
    update: {},
    create: {
      id: 'tier-silver',
      name: 'Silver',
      minPoints: 100,
      multiplier: 0.5,
      colorHex: '#94a3b8',
      sortOrder: 1,
    },
  })

  const platinumTier = await prisma.loyaltyTier.upsert({
    where: { id: 'tier-platinum' },
    update: {},
    create: {
      id: 'tier-platinum',
      name: 'Platinum',
      minPoints: 1000,
      multiplier: 2.0,
      colorHex: '#8b5cf6',
      sortOrder: 3,
    },
  })

  const tiers = [goldTier, silverTier, platinumTier]
  console.log(`Loyalty Tiers seeded: ${tiers.map(t => t.name).join(', ')}`)

  // ─── Loyalty Cards (10 — assign to first 10 customers) ───────────────────
  const customers = await prisma.customer.findMany({ take: 10 })
  console.log(`Found ${customers.length} customers for loyalty card assignment`)

  let cardsCreated = 0
  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i]

    // Skip if customer already has a loyalty card
    const existing = await prisma.loyaltyCard.findUnique({ where: { customerId: customer.id } })
    if (existing) { cardsCreated++; continue }

    const cardNo = `LC-${String(i + 1).padStart(6, '0')}`
    const program = programs[i % 3]
    const tier = tiers[i % 3]
    const availablePoints = randomInt(0, 5000)
    const lifetimePoints = availablePoints + randomInt(0, 10000)

    await prisma.loyaltyCard.upsert({
      where: { cardNumber: cardNo },
      update: {},
      create: {
        cardNumber: cardNo,
        programId: program.id,
        customerId: customer.id,
        tierId: tier.id,
        availablePoints,
        totalPoints: availablePoints,
        lifetimePoints,
        status: 'active',
      },
    })
    cardsCreated++
  }
  console.log(`Loyalty Cards seeded: ${cardsCreated}`)

  // ─── Gift Cards (8) ───────────────────────────────────────────────────────
  const twoYearsFromNow = new Date()
  twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2)

  const giftCardAmounts = [25, 50, 100, 25, 50, 200, 75, 150]
  let gcCreated = 0

  for (let i = 0; i < giftCardAmounts.length; i++) {
    const cardNo = `GC-${String(i + 1).padStart(6, '0')}`
    const amount = giftCardAmounts[i]

    await prisma.giftCard.upsert({
      where: { cardNumber: cardNo },
      update: {},
      create: {
        cardNumber: cardNo,
        initialAmt: amount,
        balance: amount,
        status: 'active',
        expiresAt: twoYearsFromNow,
      },
    })
    gcCreated++
  }
  console.log(`Gift Cards seeded: ${gcCreated} (totaling $${giftCardAmounts.reduce((a, b) => a + b, 0)})`)

  // ─── Employee Passwords (fix 5 placeholder hashes) ────────────────────────
  const managerHash = await bcrypt.hash('Manager123!', 10)
  const cashierHash = await bcrypt.hash('Cashier123!', 10)

  const managerEmails = ['sarah.manager@novapos.local', 'daniel.asst@novapos.local']
  const cashierEmails = ['jessica.cash@novapos.local', 'marcus.cash@novapos.local', 'amy.cash@novapos.local']

  const managerResult = await prisma.user.updateMany({
    where: { email: { in: managerEmails } },
    data: { passwordHash: managerHash },
  })

  const cashierResult = await prisma.user.updateMany({
    where: { email: { in: cashierEmails } },
    data: { passwordHash: cashierHash },
  })

  console.log(`Employee passwords updated: ${managerResult.count} managers, ${cashierResult.count} cashiers`)

  // ─── Final Counts ─────────────────────────────────────────────────────────
  const [programCount, cardCount, gcCount] = await Promise.all([
    prisma.loyaltyProgram.count(),
    prisma.loyaltyCard.count(),
    prisma.giftCard.count(),
  ])

  console.log('\n=== Final Counts ===')
  console.log(`  LoyaltyProgram: ${programCount}`)
  console.log(`  LoyaltyCard:    ${cardCount}`)
  console.log(`  GiftCard:       ${gcCount}`)
  console.log('\n=== seed-loyalty-gifts.ts complete ===\n')
}

main().catch(console.error).finally(() => prisma.$disconnect())
