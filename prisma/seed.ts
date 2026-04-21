import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({ url: 'file:prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Store
  const store = await prisma.store.upsert({
    where: { id: 'store-main' },
    update: {},
    create: {
      id: 'store-main',
      name: 'Main Street Store',
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      phone: '512-555-0100',
      email: 'main@store.local',
      taxRate: 0.0825,
    },
  })
  console.log('Store:', store.name)

  // Categories
  const cats = await Promise.all([
    prisma.productCategory.upsert({ where: { slug: 'beverages' }, update: {}, create: { name: 'Beverages', slug: 'beverages', color: '#3b82f6' } }),
    prisma.productCategory.upsert({ where: { slug: 'snacks' }, update: {}, create: { name: 'Snacks', slug: 'snacks', color: '#f59e0b' } }),
    prisma.productCategory.upsert({ where: { slug: 'electronics' }, update: {}, create: { name: 'Electronics', slug: 'electronics', color: '#8b5cf6' } }),
    prisma.productCategory.upsert({ where: { slug: 'clothing' }, update: {}, create: { name: 'Clothing', slug: 'clothing', color: '#ec4899' } }),
  ])
  console.log('Categories:', cats.map(c => c.name).join(', '))

  // Products
  const products = await Promise.all([
    prisma.product.upsert({ where: { sku: 'BEV-001' }, update: {}, create: { sku: 'BEV-001', name: 'Premium Coffee', categoryId: cats[0].id, costPrice: 1.25, salePrice: 4.99, unit: 'cup', reorderPoint: 10, reorderQty: 50 } }),
    prisma.product.upsert({ where: { sku: 'BEV-002' }, update: {}, create: { sku: 'BEV-002', name: 'Green Tea', categoryId: cats[0].id, costPrice: 0.75, salePrice: 3.49, unit: 'cup', reorderPoint: 8, reorderQty: 40 } }),
    prisma.product.upsert({ where: { sku: 'SNK-001' }, update: {}, create: { sku: 'SNK-001', name: 'Artisan Crackers', categoryId: cats[1].id, costPrice: 1.50, salePrice: 5.99, unit: 'pack', reorderPoint: 5, reorderQty: 25 } }),
    prisma.product.upsert({ where: { sku: 'SNK-002' }, update: {}, create: { sku: 'SNK-002', name: 'Trail Mix', categoryId: cats[1].id, costPrice: 2.00, salePrice: 7.99, unit: 'bag', reorderPoint: 5, reorderQty: 20 } }),
    prisma.product.upsert({ where: { sku: 'ELC-001' }, update: {}, create: { sku: 'ELC-001', name: 'USB-C Cable 3ft', categoryId: cats[2].id, costPrice: 3.00, salePrice: 14.99, unit: 'each', reorderPoint: 10, reorderQty: 30 } }),
    prisma.product.upsert({ where: { sku: 'ELC-002' }, update: {}, create: { sku: 'ELC-002', name: 'Wireless Earbuds', categoryId: cats[2].id, costPrice: 25.00, salePrice: 79.99, unit: 'each', reorderPoint: 5, reorderQty: 15 } }),
    prisma.product.upsert({ where: { sku: 'CLT-001' }, update: {}, create: { sku: 'CLT-001', name: 'Logo Tee Shirt', categoryId: cats[3].id, costPrice: 8.00, salePrice: 24.99, unit: 'each', reorderPoint: 10, reorderQty: 25 } }),
    prisma.product.upsert({ where: { sku: 'CLT-002' }, update: {}, create: { sku: 'CLT-002', name: 'Hoodie Premium', categoryId: cats[3].id, costPrice: 22.00, salePrice: 59.99, unit: 'each', reorderPoint: 5, reorderQty: 15 } }),
  ])
  console.log('Products:', products.length)

  // Inventory
  for (const product of products) {
    await prisma.inventory.upsert({
      where: { productId_storeId: { productId: product.id, storeId: store.id } },
      update: {},
      create: {
        productId: product.id,
        storeId: store.id,
        quantity: Math.floor(Math.random() * 50) + 10,
        reserved: 0,
      },
    })
  }
  console.log('Inventory seeded')

  // Customers
  const customers = await Promise.all([
    prisma.customer.upsert({ where: { email: 'alice@example.com' }, update: {}, create: { firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', phone: '512-555-0201', city: 'Austin', state: 'TX', loyaltyPoints: 250, totalSpent: 487.50, visitCount: 12 } }),
    prisma.customer.upsert({ where: { email: 'bob@example.com' }, update: {}, create: { firstName: 'Bob', lastName: 'Martinez', email: 'bob@example.com', phone: '512-555-0202', city: 'Austin', state: 'TX', loyaltyPoints: 85, totalSpent: 124.99, visitCount: 4 } }),
    prisma.customer.upsert({ where: { email: 'carol@example.com' }, update: {}, create: { firstName: 'Carol', lastName: 'Smith', email: 'carol@example.com', phone: '512-555-0203', city: 'Round Rock', state: 'TX', loyaltyPoints: 1200, totalSpent: 2340.00, visitCount: 45 } }),
  ])
  console.log('Customers:', customers.length)

  console.log('\nSeed complete!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
