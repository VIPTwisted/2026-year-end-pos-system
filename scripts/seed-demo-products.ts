import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({ url: 'file:prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

// Picsum gives a consistent photo per seed word — perfect for demo
const pic = (seed: string) => `https://picsum.photos/seed/${seed}/400/400`

const CATEGORIES = [
  { name: 'Electronics',      slug: 'electronics',   color: '#0078d4', icon: '💻' },
  { name: 'Beverages',        slug: 'beverages',     color: '#107c10', icon: '☕' },
  { name: 'Snacks & Food',    slug: 'snacks',        color: '#e67e22', icon: '🍿' },
  { name: 'Clothing',         slug: 'clothing',      color: '#8e44ad', icon: '👕' },
  { name: 'Home & Kitchen',   slug: 'home-kitchen',  color: '#e74c3c', icon: '🏠' },
  { name: 'Sports & Outdoors',slug: 'sports',        color: '#27ae60', icon: '⚽' },
  { name: 'Beauty & Health',  slug: 'beauty',        color: '#e91e8c', icon: '💄' },
  { name: 'Toys & Games',     slug: 'toys',          color: '#f39c12', icon: '🎮' },
]

const PRODUCTS = [
  // ── Electronics (10)
  { sku:'ELEC-001', name:'Wireless Earbuds Pro',       cat:'electronics', cost:28,  price:89.99,  img:pic('earbuds'),       desc:'Active noise cancellation, 30hr battery' },
  { sku:'ELEC-002', name:'Bluetooth Speaker Portable', cat:'electronics', cost:22,  price:59.99,  img:pic('speaker'),       desc:'360° sound, waterproof IPX5' },
  { sku:'ELEC-003', name:'USB-C Charging Hub 7-Port',  cat:'electronics', cost:15,  price:44.99,  img:pic('usb-hub'),       desc:'100W PD fast charging, 4K HDMI' },
  { sku:'ELEC-004', name:'Smart Watch Series 4',       cat:'electronics', cost:95,  price:249.99, img:pic('smartwatch'),    desc:'Heart rate, GPS, sleep tracking' },
  { sku:'ELEC-005', name:'Mechanical Keyboard TKL',    cat:'electronics', cost:45,  price:119.99, img:pic('keyboard'),      desc:'Cherry MX Red switches, RGB backlit' },
  { sku:'ELEC-006', name:'Gaming Mouse 16000 DPI',     cat:'electronics', cost:25,  price:69.99,  img:pic('mouse'),         desc:'Programmable buttons, ergonomic grip' },
  { sku:'ELEC-007', name:'Portable Power Bank 20000mAh',cat:'electronics',cost:18, price:49.99,  img:pic('powerbank'),     desc:'Dual USB-A + USB-C, LED indicator' },
  { sku:'ELEC-008', name:'Webcam 4K HD',               cat:'electronics', cost:38,  price:99.99,  img:pic('webcam'),        desc:'Auto-focus, built-in stereo mic' },
  { sku:'ELEC-009', name:'Noise Cancelling Headphones',cat:'electronics', cost:55,  price:149.99, img:pic('headphones'),    desc:'35hr battery, foldable design' },
  { sku:'ELEC-010', name:'Wireless Phone Charger 15W', cat:'electronics', cost:12,  price:34.99,  img:pic('charger-pad'),   desc:'Qi compatible, overcharge protection' },

  // ── Beverages (7)
  { sku:'BEV-001',  name:'Cold Brew Coffee 12oz',      cat:'beverages',   cost:2.5, price:6.99,   img:pic('cold-brew'),     desc:'Single origin, smooth finish' },
  { sku:'BEV-002',  name:'Matcha Latte Powder 200g',   cat:'beverages',   cost:8,   price:22.99,  img:pic('matcha'),        desc:'Ceremonial grade Japanese matcha' },
  { sku:'BEV-003',  name:'Sparkling Water Variety Pack',cat:'beverages',  cost:5,   price:14.99,  img:pic('sparkling'),     desc:'12 cans, 4 flavors, zero calories' },
  { sku:'BEV-004',  name:'Premium Green Tea 50 bags',  cat:'beverages',   cost:4,   price:12.99,  img:pic('green-tea'),     desc:'Organic, antioxidant rich' },
  { sku:'BEV-005',  name:'Protein Shake Vanilla 2lb',  cat:'beverages',   cost:18,  price:44.99,  img:pic('protein'),       desc:'25g protein per serving, low sugar' },
  { sku:'BEV-006',  name:'Kombucha Ginger Lemon 16oz', cat:'beverages',   cost:2,   price:5.49,   img:pic('kombucha'),      desc:'Raw, live cultures, naturally fizzy' },
  { sku:'BEV-007',  name:'Electrolyte Drink Mix 30pk', cat:'beverages',   cost:10,  price:29.99,  img:pic('electrolyte'),   desc:'No sugar, sodium, potassium blend' },

  // ── Snacks & Food (7)
  { sku:'SNK-001',  name:'Artisan Mixed Nuts 1lb',     cat:'snacks',      cost:6,   price:16.99,  img:pic('mixed-nuts'),    desc:'Roasted almonds, cashews, pecans' },
  { sku:'SNK-002',  name:'Dark Chocolate Bar 70%',     cat:'snacks',      cost:2,   price:5.99,   img:pic('chocolate'),     desc:'Single origin Ecuador cacao' },
  { sku:'SNK-003',  name:'Organic Granola 12oz',       cat:'snacks',      cost:4,   price:11.99,  img:pic('granola'),       desc:'Honey oat, no artificial flavors' },
  { sku:'SNK-004',  name:'Kettle Chips Sea Salt 7oz',  cat:'snacks',      cost:1.5, price:4.49,   img:pic('chips'),         desc:'Thick cut, sea salt, non-GMO' },
  { sku:'SNK-005',  name:'Beef Jerky Original 3.5oz',  cat:'snacks',      cost:4,   price:10.99,  img:pic('jerky'),         desc:'Grass-fed, low sugar marinade' },
  { sku:'SNK-006',  name:'Rice Cakes Variety 8pk',     cat:'snacks',      cost:2,   price:5.99,   img:pic('rice-cakes'),    desc:'Caramel, white cheddar, apple cinn.' },
  { sku:'SNK-007',  name:'Trail Mix Superfood 10oz',   cat:'snacks',      cost:5,   price:13.99,  img:pic('trail-mix'),     desc:'Goji berries, seeds, dark chocolate' },

  // ── Clothing (6)
  { sku:'CLO-001',  name:'Classic Crew Neck Tee',      cat:'clothing',    cost:8,   price:24.99,  img:pic('tshirt'),        desc:'100% cotton, pre-shrunk, unisex fit' },
  { sku:'CLO-002',  name:'Athletic Running Shorts',    cat:'clothing',    cost:12,  price:34.99,  img:pic('shorts'),        desc:'4-way stretch, moisture wicking' },
  { sku:'CLO-003',  name:'Zip-Up Hoodie Fleece',       cat:'clothing',    cost:22,  price:59.99,  img:pic('hoodie'),        desc:'Soft fleece lining, kangaroo pocket' },
  { sku:'CLO-004',  name:'Baseball Cap Adjustable',    cat:'clothing',    cost:6,   price:19.99,  img:pic('baseball-cap'),  desc:'Structured, 6-panel, metal buckle' },
  { sku:'CLO-005',  name:'Merino Wool Socks 3-Pack',   cat:'clothing',    cost:9,   price:24.99,  img:pic('wool-socks'),    desc:'Anti-blister, moisture control' },
  { sku:'CLO-006',  name:'Canvas Tote Bag Large',      cat:'clothing',    cost:4,   price:14.99,  img:pic('tote-bag'),      desc:'Heavy duty, zippered pocket' },

  // ── Home & Kitchen (7)
  { sku:'HOM-001',  name:'Pour-Over Coffee Dripper',   cat:'home-kitchen',cost:14, price:39.99,  img:pic('pour-over'),     desc:'Borosilicate glass, heat resistant' },
  { sku:'HOM-002',  name:'Bamboo Cutting Board Set',   cat:'home-kitchen',cost:18, price:49.99,  img:pic('cutting-board'), desc:'3-piece, juice groove, antimicrobial' },
  { sku:'HOM-003',  name:'Stainless Steel Water Bottle',cat:'home-kitchen',cost:9, price:29.99,  img:pic('water-bottle'),  desc:'32oz, double-wall insulated, leak-proof' },
  { sku:'HOM-004',  name:'Scented Soy Candle Set 3pk', cat:'home-kitchen',cost:12, price:34.99,  img:pic('candles'),       desc:'Lavender, vanilla, eucalyptus, 40hr each' },
  { sku:'HOM-005',  name:'Cast Iron Skillet 10"',      cat:'home-kitchen',cost:22, price:54.99,  img:pic('cast-iron'),     desc:'Pre-seasoned, oven safe to 500°F' },
  { sku:'HOM-006',  name:'Reusable Produce Bags 15pk', cat:'home-kitchen',cost:5,  price:14.99,  img:pic('mesh-bags'),     desc:'Mesh cotton, washable, zipper close' },
  { sku:'HOM-007',  name:'Insulated Lunch Box',        cat:'home-kitchen',cost:10, price:27.99,  img:pic('lunch-box'),     desc:'Keeps cold 8hr, BPA free, shoulder strap' },

  // ── Sports & Outdoors (7)
  { sku:'SPT-001',  name:'Resistance Band Set 5pc',    cat:'sports',      cost:8,   price:24.99,  img:pic('resistance-bands'),desc:'Light to heavy, latex free, handles' },
  { sku:'SPT-002',  name:'Yoga Mat Non-Slip 6mm',      cat:'sports',      cost:15,  price:39.99,  img:pic('yoga-mat'),      desc:'Eco-friendly TPE, carrying strap' },
  { sku:'SPT-003',  name:'Jump Rope Speed Cable',      cat:'sports',      cost:6,   price:18.99,  img:pic('jump-rope'),     desc:'Ball bearing handles, adjustable length' },
  { sku:'SPT-004',  name:'Foam Roller Deep Tissue',    cat:'sports',      cost:10,  price:29.99,  img:pic('foam-roller'),   desc:'High-density EVA, full body recovery' },
  { sku:'SPT-005',  name:'Hiking Water Bottle 32oz',   cat:'sports',      cost:14,  price:38.99,  img:pic('hiking-bottle'), desc:'BPA-free Tritan, carabiner clip' },
  { sku:'SPT-006',  name:'Gym Gloves Wrist Support',   cat:'sports',      cost:7,   price:19.99,  img:pic('gym-gloves'),    desc:'Full palm padding, breathable mesh' },
  { sku:'SPT-007',  name:'Sport Duffle Bag 40L',       cat:'sports',      cost:18,  price:49.99,  img:pic('duffle-bag'),    desc:'Wet pocket, shoe compartment, USB port' },

  // ── Beauty & Health (6)
  { sku:'BTY-001',  name:'Vitamin C Serum 1oz',        cat:'beauty',      cost:8,   price:29.99,  img:pic('vitamin-serum'), desc:'20% L-ascorbic acid, hyaluronic acid' },
  { sku:'BTY-002',  name:'Bamboo Toothbrush 4-Pack',   cat:'beauty',      cost:4,   price:12.99,  img:pic('toothbrush'),    desc:'Biodegradable, soft BPA-free bristles' },
  { sku:'BTY-003',  name:'Facial Roller Rose Quartz',  cat:'beauty',      cost:6,   price:18.99,  img:pic('face-roller'),   desc:'Double-ended, anti-aging massage' },
  { sku:'BTY-004',  name:'SPF 50 Sunscreen 3oz',       cat:'beauty',      cost:5,   price:16.99,  img:pic('sunscreen'),     desc:'Mineral, reef safe, water resistant' },
  { sku:'BTY-005',  name:'Essential Oil Set 6pc',      cat:'beauty',      cost:12,  price:34.99,  img:pic('essential-oils'),desc:'Lavender, peppermint, eucalyptus blend' },
  { sku:'BTY-006',  name:'Collagen Supplements 90ct',  cat:'beauty',      cost:14,  price:39.99,  img:pic('collagen'),      desc:'Type I & III, biotin, vitamin C' },
]

async function main() {
  console.log('🌱 Seeding 50 demo products with photos...')

  // Upsert categories
  const catMap: Record<string, string> = {}
  for (const c of CATEGORIES) {
    const cat = await prisma.productCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, color: c.color, icon: c.icon },
      create: { name: c.name, slug: c.slug, color: c.color, icon: c.icon, sortOrder: CATEGORIES.indexOf(c) },
    })
    catMap[c.slug] = cat.id
  }
  console.log(`✅ ${CATEGORIES.length} categories ready`)

  // Find a supplier for the products
  const supplier = await prisma.supplier.findFirst()

  // Find a store for inventory
  const store = await prisma.store.findFirst()

  let created = 0
  for (const p of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        description: p.desc,
        categoryId: catMap[p.cat],
        costPrice: p.cost,
        salePrice: p.price,
        imageUrl: p.img,
        isActive: true,
        trackStock: true,
        taxable: true,
      },
      create: {
        sku: p.sku,
        name: p.name,
        description: p.desc,
        categoryId: catMap[p.cat],
        costPrice: p.cost,
        salePrice: p.price,
        imageUrl: p.img,
        isActive: true,
        trackStock: true,
        taxable: true,
        unit: 'each',
        supplierId: supplier?.id ?? null,
        reorderPoint: 5,
        reorderQty: 20,
      },
    })

    // Seed inventory for each product in the main store
    if (store) {
      await prisma.inventory.upsert({
        where: { productId_storeId: { productId: product.id, storeId: store.id } },
        update: {},
        create: {
          productId: product.id,
          storeId: store.id,
          quantity: Math.floor(Math.random() * 80) + 20,
          reserved: 0,
        },
      })
    }
    created++
  }

  console.log(`✅ ${created} products seeded with images`)
  console.log('✅ Inventory seeded for each product')
  console.log('\n🎉 Demo mode ready — 50 products with Picsum photos loaded!')
  console.log('   Photos served from: https://picsum.photos/seed/<product-slug>/400/400')
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
