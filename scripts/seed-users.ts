import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const adapter = new PrismaLibSql({ url: 'file:prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

const USERS = [
  { name: 'Sarah Johnson',   email: 'sarah.manager@novapos.local',   password: 'Manager123!',   role: 'manager'     },
  { name: 'Daniel Chen',     email: 'daniel.asst@novapos.local',      password: 'Manager123!',   role: 'manager'     },
  { name: 'Jessica Williams',email: 'jessica.cash@novapos.local',     password: 'Cashier123!',   role: 'cashier'     },
  { name: 'Marcus Brown',    email: 'marcus.cash@novapos.local',      password: 'Cashier123!',   role: 'cashier'     },
  { name: 'Amy Davis',       email: 'amy.cash@novapos.local',         password: 'Cashier123!',   role: 'cashier'     },
  { name: 'Mike Torres',     email: 'mike.warehouse@novapos.local',   password: 'Warehouse123!', role: 'warehouse'   },
  { name: 'Linda Park',      email: 'linda.accountant@novapos.local', password: 'Account123!',   role: 'accountant'  },
]

async function main() {
  console.log('='.repeat(55))
  console.log('  NovaPOS — Seed Missing User Accounts')
  console.log('='.repeat(55))

  let created = 0
  let skipped = 0

  for (const u of USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } })

    if (existing) {
      console.log(`  SKIP  ${u.email}  (already exists)`)
      skipped++
      continue
    }

    const passwordHash = await bcrypt.hash(u.password, 10)

    await prisma.user.create({
      data: {
        email:        u.email,
        name:         u.name,
        role:         u.role,
        passwordHash,
        isActive:     true,
      },
    })

    console.log(`  CREATE ${u.email}  [${u.role}]`)
    created++
  }

  console.log('\n' + '─'.repeat(55))
  console.log(`  Created: ${created}  |  Skipped: ${skipped}`)

  const total = await prisma.user.count()
  console.log(`  Total users in DB: ${total}`)
  console.log('='.repeat(55))

  const all = await prisma.user.findMany({
    select: { email: true, name: true, role: true, isActive: true },
    orderBy: { role: 'asc' },
  })
  console.log('\nAll users:')
  for (const u of all) {
    console.log(`  [${u.role.padEnd(11)}] ${u.name.padEnd(22)} ${u.email}`)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
