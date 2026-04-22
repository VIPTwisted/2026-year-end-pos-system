const { PrismaClient } = require('@prisma/client')
const { PrismaLibSql } = require('@prisma/adapter-libsql')

const adapter = new PrismaLibSql({ url: 'file:prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

const CUSTOMERS = [
  { firstName: 'Karen',    lastName: 'Berg',      email: 'karen.berg@email.com',     phone: '(206) 555-0101', address: '712 1st Ave SW', city: 'Kirkland',   state: 'WA', zip: '98007', loyaltyPoints: 890 },
  { firstName: 'Marcus',   lastName: 'Johnson',   email: 'marcus.j@email.com',        phone: '(425) 555-0182', address: '3401 Fremont Ave N', city: 'Seattle', state: 'WA', zip: '98103', loyaltyPoints: 2450 },
  { firstName: 'Priya',    lastName: 'Patel',     email: 'priya.patel@email.com',     phone: '(206) 555-0247', address: '881 Oak Blvd',   city: 'Bellevue',   state: 'WA', zip: '98004', loyaltyPoints: 175 },
  { firstName: 'David',    lastName: 'Kim',       email: 'david.kim@email.com',       phone: '(253) 555-0319', address: '550 Main St #4B', city: 'Tacoma',    state: 'WA', zip: '98401', loyaltyPoints: 3200 },
  { firstName: 'Sofia',    lastName: 'Martinez',  email: 'sofia.m@email.com',         phone: '(360) 555-0441', address: '22 Harbor View Dr', city: 'Everett', state: 'WA', zip: '98201', loyaltyPoints: 540 },
  { firstName: 'James',    lastName: 'Williams',  email: 'james.w@email.com',         phone: '(206) 555-0563', address: '1407 Pine St',   city: 'Seattle',    state: 'WA', zip: '98101', loyaltyPoints: 1100 },
  { firstName: 'Aisha',    lastName: 'Hassan',    email: 'aisha.hassan@email.com',    phone: '(425) 555-0672', address: '99 Lakeside Ct', city: 'Redmond',    state: 'WA', zip: '98052', loyaltyPoints: 730 },
  { firstName: 'Tyler',    lastName: 'Brooks',    email: 'tyler.brooks@email.com',    phone: '(206) 555-0784', address: '308 Aurora Ave N', city: 'Seattle',  state: 'WA', zip: '98109', loyaltyPoints: 60  },
  { firstName: 'Emma',     lastName: 'Nguyen',    email: 'emma.nguyen@email.com',     phone: '(425) 555-0895', address: '741 Willows Rd', city: 'Kirkland',   state: 'WA', zip: '98034', loyaltyPoints: 4800 },
  { firstName: 'Robert',   lastName: 'Chen',      email: 'robert.chen@email.com',     phone: '(206) 555-0912', address: '2015 Market St', city: 'Ballard',    state: 'WA', zip: '98107', loyaltyPoints: 320 },
  { firstName: 'Fatima',   lastName: 'Ali',       email: 'fatima.ali@email.com',      phone: '(253) 555-1033', address: '1660 S 336th St', city: 'Federal Way', state: 'WA', zip: '98003', loyaltyPoints: 1550 },
  { firstName: 'Nathan',   lastName: 'Scott',     email: 'nathan.scott@email.com',    phone: '(425) 555-1145', address: '7810 NE 148th Pl', city: 'Bothell',  state: 'WA', zip: '98011', loyaltyPoints: 980 },
  { firstName: 'Isabella', lastName: 'Rodriguez', email: 'isabella.r@email.com',      phone: '(206) 555-1267', address: '4221 Roosevelt Way', city: 'Seattle', state: 'WA', zip: '98105', loyaltyPoints: 2100 },
  { firstName: 'Kevin',    lastName: 'Park',      email: 'kevin.park@email.com',      phone: '(425) 555-1388', address: '15 Cascade Ave',  city: 'Renton',    state: 'WA', zip: '98057', loyaltyPoints: 415 },
  { firstName: 'Olivia',   lastName: 'Thompson',  email: 'olivia.t@email.com',        phone: '(206) 555-1491', address: '602 Queen Anne Ave N', city: 'Seattle', state: 'WA', zip: '98109', loyaltyPoints: 670 },
]

const VENDORS = [
  { name: 'Pacific Northwest Distributors',  email: 'orders@pnwdist.com',      phone: '(206) 800-1001', address: '500 Industrial Way',   city: 'Auburn',     state: 'WA', zip: '98001', website: 'https://pnwdist.com',      paymentTerms: 'Net 30', currency: 'USD' },
  { name: 'TechSource Global',               email: 'supply@techsource.io',    phone: '(888) 555-2200', address: '1200 Tech Blvd',       city: 'Redmond',    state: 'WA', zip: '98052', website: 'https://techsource.io',    paymentTerms: 'Net 45', currency: 'USD' },
  { name: 'Cascade Food & Beverage Co.',     email: 'orders@cascadefb.com',    phone: '(253) 555-3310', address: '88 Valley Rd',         city: 'Kent',       state: 'WA', zip: '98032', website: 'https://cascadefb.com',    paymentTerms: 'Net 15', currency: 'USD' },
  { name: 'Summit Apparel Wholesale',        email: 'wholesale@summitapp.com', phone: '(425) 555-4420', address: '2201 Commerce Pkwy',   city: 'Lynnwood',   state: 'WA', zip: '98036', website: 'https://summitapp.com',    paymentTerms: 'Net 30', currency: 'USD' },
  { name: 'HomePro Supply Chain',            email: 'supply@homepro.net',      phone: '(360) 555-5531', address: '4400 Harbor Blvd',     city: 'Everett',    state: 'WA', zip: '98203', website: 'https://homepro.net',      paymentTerms: 'Net 30', currency: 'USD' },
  { name: 'FitLife Sports Distributors',     email: 'orders@fitlifedist.com',  phone: '(206) 555-6642', address: '9900 Eastside Dr',     city: 'Bellevue',   state: 'WA', zip: '98007', website: 'https://fitlifedist.com',  paymentTerms: 'Net 60', currency: 'USD' },
  { name: 'Glow Beauty Supply',              email: 'orders@glowbeauty.com',   phone: '(425) 555-7753', address: '310 Rose St Suite 12', city: 'Kirkland',   state: 'WA', zip: '98034', website: 'https://glowbeauty.com',   paymentTerms: 'Net 15', currency: 'USD' },
  { name: 'Rainier Specialty Imports',       email: 'hello@rainierimports.com',phone: '(206) 555-8864', address: '1717 Western Ave',     city: 'Seattle',    state: 'WA', zip: '98101', website: 'https://rainierimports.com',paymentTerms: 'Net 30', currency: 'USD' },
]

async function main() {
  console.log('🌱 Seeding demo customers and vendors...')

  let custCreated = 0
  for (const c of CUSTOMERS) {
    await prisma.customer.upsert({
      where: { email: c.email },
      update: {},
      create: {
        firstName:     c.firstName,
        lastName:      c.lastName,
        email:         c.email,
        phone:         c.phone,
        address:       c.address,
        city:          c.city,
        state:         c.state,
        zip:           c.zip,
        loyaltyPoints: c.loyaltyPoints,
        isActive:      true,
      }
    })
    custCreated++
  }
  console.log(`✅ ${custCreated} customers upserted`)

  let vendCreated = 0
  for (const v of VENDORS) {
    const exists = await prisma.supplier.findFirst({ where: { name: v.name } })
    if (!exists) {
      await prisma.supplier.create({
        data: {
          name:         v.name,
          contactName:  v.email,
          phone:        v.phone,
          address:      v.address,
          city:         v.city,
          state:        v.state,
          zip:          v.zip,
          paymentTerms: v.paymentTerms,
          isActive:     true,
        }
      })
      vendCreated++
    }
  }
  console.log(`✅ ${vendCreated} vendors/suppliers upserted`)
  console.log('\n🎉 Demo data ready — platform has full test data set!')
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
