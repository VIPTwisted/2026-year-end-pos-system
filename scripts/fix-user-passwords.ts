import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const adapter = new PrismaLibSql({ url: 'file:prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

const UPDATES = [
  { email: 'sarah.manager@novapos.local', password: 'Manager123!' },
  { email: 'daniel.asst@novapos.local',   password: 'Manager123!' },
  { email: 'jessica.cash@novapos.local',  password: 'Cashier123!' },
  { email: 'marcus.cash@novapos.local',   password: 'Cashier123!' },
  { email: 'amy.cash@novapos.local',      password: 'Cashier123!' },
]

async function main() {
  console.log('='.repeat(55))
  console.log('  NovaPOS — Fix User Passwords')
  console.log('='.repeat(55))

  let updated = 0
  let skipped = 0

  for (const u of UPDATES) {
    try {
      const existing = await prisma.user.findUnique({ where: { email: u.email } })

      if (!existing) {
        console.log(`  SKIP   ${u.email}  (user not found)`)
        skipped++
        continue
      }

      const passwordHash = await bcrypt.hash(u.password, 10)

      await prisma.user.update({
        where: { email: u.email },
        data:  { passwordHash },
      })

      console.log(`  OK     ${u.email}`)
      updated++
    } catch (err) {
      console.error(`  ERROR  ${u.email}:`, err)
    }
  }

  console.log('\n' + '─'.repeat(55))
  console.log(`  Updated: ${updated}  |  Skipped: ${skipped}`)
  console.log('='.repeat(55))
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
