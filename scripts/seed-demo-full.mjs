// seed-demo-full.mjs — Full NovaPOS demo seed
// Using CommonJS-compatible require() to match other seed scripts
// Run: node scripts/seed-demo-full.mjs

const { PrismaClient } = require('@prisma/client')
const { PrismaLibSql } = require('@prisma/adapter-libsql')

const adapter = new PrismaLibSql({ url: 'file:prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

const FLAGS = []
const SUMMARY = {}

function flag(msg) { FLAGS.push(msg); console.log('FLAG:', msg) }
function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randFloat(min, max, dec) { dec = dec || 2; return parseFloat((Math.random() * (max - min) + min).toFixed(dec)) }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d }

// ══════════════════════════════════════════════════════════════
// SECTION 0 — Get/Create Store
// ══════════════════════════════════════════════════════════════
async function getStores() {
  const stores = await prisma.store.findMany()
  if (stores.length === 0) {
    flag('No stores found — creating default store')
    const s = await prisma.store.create({
      data: {
        name: 'NovaPOS Main Store',
        address: '1001 Commerce Blvd',
        city: 'Seattle',
        state: 'WA',
        zip: '98101',
        phone: '(206) 555-0100',
        email: 'main@novapos.com',
        taxRate: 0.1025,
        currency: 'USD',
        isActive: true,
      }
    })
    return [s]
  }
  return stores
}

// ══════════════════════════════════════════════════════════════
// SECTION 1 — Categories + Products
// ══════════════════════════════════════════════════════════════
const CATEGORY_DEFS = [
  { name: 'Electronics',       slug: 'electronics',    color: '#0078d4', icon: 'Laptop',    sortOrder: 1 },
  { name: 'Clothing',          slug: 'clothing',        color: '#8e44ad', icon: 'Shirt',     sortOrder: 2 },
  { name: 'Food & Beverage',   slug: 'food-beverage',   color: '#e67e22', icon: 'Coffee',    sortOrder: 3 },
  { name: 'Health & Beauty',   slug: 'health-beauty',   color: '#e91e8c', icon: 'Heart',     sortOrder: 4 },
  { name: 'Home & Garden',     slug: 'home-garden',     color: '#27ae60', icon: 'Home',      sortOrder: 5 },
  { name: 'Toys & Games',      slug: 'toys-games',      color: '#f39c12', icon: 'Gamepad2',  sortOrder: 6 },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', color: '#2ecc71', icon: 'Trophy',    sortOrder: 7 },
  { name: 'Books & Media',     slug: 'books-media',     color: '#3498db', icon: 'BookOpen',  sortOrder: 8 },
  { name: 'Office Supplies',   slug: 'office-supplies', color: '#95a5a6', icon: 'Paperclip', sortOrder: 9 },
  { name: 'Automotive',        slug: 'automotive',      color: '#e74c3c', icon: 'Car',       sortOrder: 10 },
]

const PRODUCT_DEFS = [
  // Electronics (10)
  { sku:'PROD-001', name:'Wireless Earbuds Pro',           cat:'electronics',    cost:28,  price:89.99,  stock:120, rp:20, desc:'Active noise cancellation, 30hr battery' },
  { sku:'PROD-002', name:'Bluetooth Speaker Portable',     cat:'electronics',    cost:22,  price:59.99,  stock:85,  rp:15, desc:'360deg sound, waterproof IPX5' },
  { sku:'PROD-003', name:'USB-C Charging Hub 7-Port',      cat:'electronics',    cost:15,  price:44.99,  stock:200, rp:30, desc:'100W PD fast charging, 4K HDMI' },
  { sku:'PROD-004', name:'Smart Watch Series 4',           cat:'electronics',    cost:95,  price:249.99, stock:42,  rp:10, desc:'Heart rate, GPS, sleep tracking' },
  { sku:'PROD-005', name:'Mechanical Keyboard TKL',        cat:'electronics',    cost:45,  price:119.99, stock:63,  rp:10, desc:'Cherry MX Red switches, RGB backlit' },
  { sku:'PROD-006', name:'Gaming Mouse 16000 DPI',         cat:'electronics',    cost:25,  price:69.99,  stock:91,  rp:15, desc:'Programmable 8 buttons, ergonomic grip' },
  { sku:'PROD-007', name:'Portable Power Bank 20000mAh',   cat:'electronics',    cost:18,  price:49.99,  stock:155, rp:25, desc:'Dual USB-A + USB-C, LED indicator' },
  { sku:'PROD-008', name:'Webcam 4K HD Auto-Focus',        cat:'electronics',    cost:38,  price:99.99,  stock:47,  rp:10, desc:'Built-in stereo mic, plug-and-play' },
  { sku:'PROD-009', name:'Smart Home Hub Mini',            cat:'electronics',    cost:32,  price:79.99,  stock:68,  rp:12, desc:'Controls 100+ devices, voice assist' },
  { sku:'PROD-010', name:'LED Desk Lamp Wireless Charger', cat:'electronics',    cost:19,  price:54.99,  stock:110, rp:20, desc:'3 color modes, 10W wireless charging pad' },
  // Clothing (10)
  { sku:'PROD-011', name:'Classic Cotton T-Shirt',         cat:'clothing',       cost:8,   price:24.99,  stock:300, rp:50, desc:'100% organic cotton, 6 colors' },
  { sku:'PROD-012', name:'Slim Fit Chinos',                cat:'clothing',       cost:22,  price:59.99,  stock:150, rp:30, desc:'Stretch fabric, multiple inseam lengths' },
  { sku:'PROD-013', name:'Fleece Zip-Up Hoodie',           cat:'clothing',       cost:28,  price:74.99,  stock:88,  rp:20, desc:'Anti-pill fleece, kangaroo pocket' },
  { sku:'PROD-014', name:'Athletic Running Shorts',        cat:'clothing',       cost:12,  price:34.99,  stock:200, rp:40, desc:'Moisture-wicking, inner liner, reflective' },
  { sku:'PROD-015', name:'Denim Jacket Classic',           cat:'clothing',       cost:35,  price:89.99,  stock:72,  rp:15, desc:'Rigid denim, button closure, chest pockets' },
  { sku:'PROD-016', name:'Crew Neck Sweater Wool Blend',   cat:'clothing',       cost:40,  price:104.99, stock:55,  rp:12, desc:'70% merino wool, machine washable' },
  { sku:'PROD-017', name:'Polo Shirt Performance',         cat:'clothing',       cost:15,  price:44.99,  stock:175, rp:30, desc:'UPF 50+, 4-way stretch, moisture-wicking' },
  { sku:'PROD-018', name:'Compression Leggings',           cat:'clothing',       cost:18,  price:49.99,  stock:130, rp:25, desc:'High-waist, 7/8 length, squat-proof' },
  { sku:'PROD-019', name:'Flannel Shirt Long Sleeve',      cat:'clothing',       cost:20,  price:54.99,  stock:95,  rp:20, desc:'100% cotton flannel, button-down collar' },
  { sku:'PROD-020', name:'Waterproof Rain Jacket',         cat:'clothing',       cost:55,  price:139.99, stock:40,  rp:10, desc:'Seam-sealed, adjustable hood, pit zips' },
  // Food & Beverage (10)
  { sku:'PROD-021', name:'Premium Roast Coffee Beans 1lb', cat:'food-beverage',  cost:9,   price:22.99,  stock:220, rp:40, desc:'Single-origin Ethiopian, medium roast' },
  { sku:'PROD-022', name:'Organic Green Tea 50 bags',      cat:'food-beverage',  cost:5,   price:14.99,  stock:310, rp:50, desc:'Ceremonial grade, individually wrapped' },
  { sku:'PROD-023', name:'Protein Bar Box 12-pack',        cat:'food-beverage',  cost:14,  price:34.99,  stock:180, rp:30, desc:'20g protein, 5 flavors, no artificial sweeteners' },
  { sku:'PROD-024', name:'Cold Brew Coffee Concentrate',   cat:'food-beverage',  cost:7,   price:18.99,  stock:140, rp:25, desc:'32oz bottle, makes 64oz' },
  { sku:'PROD-025', name:'Mixed Nut Trail Mix 2lb',        cat:'food-beverage',  cost:11,  price:28.99,  stock:165, rp:30, desc:'Almonds, cashews, walnuts, dried cranberry' },
  { sku:'PROD-026', name:'Sparkling Water 12-pack',        cat:'food-beverage',  cost:8,   price:19.99,  stock:250, rp:40, desc:'Unsweetened, 6 natural flavors' },
  { sku:'PROD-027', name:'Artisan Hot Sauce Set 3-pack',   cat:'food-beverage',  cost:10,  price:24.99,  stock:120, rp:20, desc:'Mild, medium, hot — small-batch craft' },
  { sku:'PROD-028', name:'Gourmet Popcorn Gift Tin',       cat:'food-beverage',  cost:12,  price:29.99,  stock:95,  rp:15, desc:'3 flavors: cheddar, caramel, classic butter' },
  { sku:'PROD-029', name:'Dark Chocolate Bar 72pct 12pk',  cat:'food-beverage',  cost:16,  price:39.99,  stock:140, rp:25, desc:'Fair trade cacao, individually wrapped' },
  { sku:'PROD-030', name:'Electrolyte Sports Drink Mix',   cat:'food-beverage',  cost:18,  price:44.99,  stock:190, rp:35, desc:'30-serving canister, 5 flavors, zero sugar' },
  // Health & Beauty (10)
  { sku:'PROD-031', name:'Vitamin D3 K2 Supplement',       cat:'health-beauty',  cost:8,   price:22.99,  stock:200, rp:35, desc:'2000 IU D3, 100mcg K2, 90 softgels' },
  { sku:'PROD-032', name:'Facial Moisturizer SPF 30',       cat:'health-beauty',  cost:12,  price:32.99,  stock:155, rp:25, desc:'Broad spectrum, hyaluronic acid, oil-free' },
  { sku:'PROD-033', name:'Collagen Peptides Powder',        cat:'health-beauty',  cost:20,  price:52.99,  stock:110, rp:20, desc:'Hydrolyzed, unflavored, 16oz pouch' },
  { sku:'PROD-034', name:'Electric Toothbrush Sonic',       cat:'health-beauty',  cost:22,  price:59.99,  stock:88,  rp:15, desc:'40,000 strokes/min, 2-min smart timer' },
  { sku:'PROD-035', name:'Shampoo Conditioner Bundle',      cat:'health-beauty',  cost:14,  price:36.99,  stock:175, rp:30, desc:'Sulfate-free, argan oil, 16oz each' },
  { sku:'PROD-036', name:'Retinol Night Serum',             cat:'health-beauty',  cost:18,  price:48.99,  stock:92,  rp:15, desc:'0.5% retinol, vitamin E, 1oz dropper' },
  { sku:'PROD-037', name:'Magnesium Glycinate Capsules',    cat:'health-beauty',  cost:10,  price:26.99,  stock:160, rp:30, desc:'400mg elemental Mg, 120 caps, chelated' },
  { sku:'PROD-038', name:'Beard Care Kit',                  cat:'health-beauty',  cost:16,  price:42.99,  stock:80,  rp:15, desc:'Oil, balm, comb — premium gift box' },
  { sku:'PROD-039', name:'Yoga Mat Premium 6mm',            cat:'health-beauty',  cost:20,  price:54.99,  stock:65,  rp:12, desc:'Non-slip surface, alignment lines, strap' },
  { sku:'PROD-040', name:'Resistance Band Set 5-pack',      cat:'health-beauty',  cost:10,  price:27.99,  stock:185, rp:30, desc:'5 resistance levels, 12-inch loops' },
  // Home & Garden (10)
  { sku:'PROD-041', name:'Cast Iron Skillet 12 inch',       cat:'home-garden',    cost:25,  price:64.99,  stock:90,  rp:15, desc:'Pre-seasoned, oven-safe to 500F' },
  { sku:'PROD-042', name:'Air Purifier HEPA H13',           cat:'home-garden',    cost:55,  price:149.99, stock:48,  rp:10, desc:'True HEPA + activated carbon, 500 sq ft' },
  { sku:'PROD-043', name:'Insulated Stainless Tumbler 30oz',cat:'home-garden',    cost:12,  price:34.99,  stock:210, rp:35, desc:'Double-wall vacuum, 10 colors, lid included' },
  { sku:'PROD-044', name:'LED Grow Light Full Spectrum',    cat:'home-garden',    cost:28,  price:74.99,  stock:66,  rp:12, desc:'300W equivalent, timer function, dimmable' },
  { sku:'PROD-045', name:'Bamboo Cutting Board Set',        cat:'home-garden',    cost:14,  price:38.99,  stock:125, rp:20, desc:'3-piece: small, medium, large' },
  { sku:'PROD-046', name:'French Press Coffee Maker',       cat:'home-garden',    cost:18,  price:49.99,  stock:88,  rp:15, desc:'34oz borosilicate glass, stainless plunger' },
  { sku:'PROD-047', name:'Robot Vacuum Slim Profile',       cat:'home-garden',    cost:88,  price:229.99, stock:30,  rp:8,  desc:'WiFi + app control, 120-min runtime' },
  { sku:'PROD-048', name:'Garden Hose Expandable 50ft',     cat:'home-garden',    cost:18,  price:48.99,  stock:95,  rp:15, desc:'Triple-layer latex, 10-pattern nozzle' },
  { sku:'PROD-049', name:'Scented Soy Candle 3-Pack',       cat:'home-garden',    cost:12,  price:32.99,  stock:145, rp:25, desc:'40hr burn each, lavender/cedar/vanilla' },
  { sku:'PROD-050', name:'Throw Blanket Fleece XL',         cat:'home-garden',    cost:16,  price:44.99,  stock:115, rp:20, desc:'50x70 in, machine washable, 8 colors' },
  // Toys & Games (10)
  { sku:'PROD-051', name:'STEM Robot Kit Ages 8+',          cat:'toys-games',     cost:28,  price:74.99,  stock:75,  rp:12, desc:'Build and code your own robot, 250 pieces' },
  { sku:'PROD-052', name:'Strategy Board Game',             cat:'toys-games',     cost:18,  price:49.99,  stock:110, rp:20, desc:'2-6 players, 60-90 min, ages 10+' },
  { sku:'PROD-053', name:'Remote Control Car 4WD',          cat:'toys-games',     cost:22,  price:59.99,  stock:88,  rp:15, desc:'1:16 scale, 2.4GHz, 30km/h top speed' },
  { sku:'PROD-054', name:'Magnetic Drawing Board XL',       cat:'toys-games',     cost:12,  price:32.99,  stock:130, rp:25, desc:'No mess, colorful stamps, ages 3+' },
  { sku:'PROD-055', name:'Educational Flash Cards 200pc',   cat:'toys-games',     cost:7,   price:19.99,  stock:200, rp:35, desc:'Sight words, math, animals — wipe-clean' },
  { sku:'PROD-056', name:'Wooden Puzzle 500 pieces',        cat:'toys-games',     cost:10,  price:27.99,  stock:95,  rp:15, desc:'Forest animals, quality press-board' },
  { sku:'PROD-057', name:'Slime Making Kit',                cat:'toys-games',     cost:8,   price:22.99,  stock:160, rp:30, desc:'8 batches, glitter, foam beads, scent packs' },
  { sku:'PROD-058', name:'Playing Cards Premium 2-Deck',    cat:'toys-games',     cost:5,   price:14.99,  stock:250, rp:40, desc:'Linen finish, poker size, waterproof coating' },
  { sku:'PROD-059', name:'Action Figure Collector Set',     cat:'toys-games',     cost:20,  price:54.99,  stock:60,  rp:10, desc:'12 unique characters, 5in articulated' },
  { sku:'PROD-060', name:'Foam Dart Blaster Party Pack',    cat:'toys-games',     cost:18,  price:48.99,  stock:85,  rp:15, desc:'4 blasters, 100 darts, team play set' },
  // Sports & Outdoors (10)
  { sku:'PROD-061', name:'Adjustable Dumbbell Set 5-50lb',  cat:'sports-outdoors',cost:88,  price:229.99, stock:35,  rp:8,  desc:'Single dumbbell, 15 weight settings' },
  { sku:'PROD-062', name:'Running Shoes Cushioned',         cat:'sports-outdoors',cost:40,  price:109.99, stock:70,  rp:15, desc:'Responsive foam, breathable mesh upper' },
  { sku:'PROD-063', name:'Camping Hammock Double',          cat:'sports-outdoors',cost:18,  price:49.99,  stock:95,  rp:15, desc:'Nylon parachute fabric, 500lb capacity' },
  { sku:'PROD-064', name:'Hydration Pack 2L',               cat:'sports-outdoors',cost:22,  price:59.99,  stock:80,  rp:12, desc:'Backpack with reservoir, 8 storage pockets' },
  { sku:'PROD-065', name:'Jump Rope Speed Pro',             cat:'sports-outdoors',cost:9,   price:24.99,  stock:150, rp:25, desc:'Ball bearings, adjustable cable, ergonomic grip' },
  { sku:'PROD-066', name:'Folding Camping Chair',           cat:'sports-outdoors',cost:22,  price:58.99,  stock:65,  rp:12, desc:'350lb capacity, cup holder, carry bag' },
  { sku:'PROD-067', name:'Fitness Tracker Band',            cat:'sports-outdoors',cost:28,  price:74.99,  stock:88,  rp:15, desc:'Heart rate, SpO2, 7-day battery, swim-proof' },
  { sku:'PROD-068', name:'Foam Roller High Density 36in',   cat:'sports-outdoors',cost:14,  price:38.99,  stock:120, rp:20, desc:'Extra firm, grid texture, lightweight' },
  { sku:'PROD-069', name:'Waterproof Hiking Boots',         cat:'sports-outdoors',cost:55,  price:149.99, stock:45,  rp:10, desc:'Gore-Tex liner, Vibram outsole, ankle support' },
  { sku:'PROD-070', name:'Bicycle Helmet LED Safety',       cat:'sports-outdoors',cost:22,  price:59.99,  stock:72,  rp:12, desc:'CPSC certified, integrated LED, 11 vents' },
  // Books & Media (10)
  { sku:'PROD-071', name:'Business Strategy Hardcover',     cat:'books-media',    cost:10,  price:28.99,  stock:95,  rp:15, desc:'Bestselling MBA frameworks, 320 pages' },
  { sku:'PROD-072', name:'Mindfulness Meditation Guide',    cat:'books-media',    cost:8,   price:19.99,  stock:130, rp:25, desc:'8-week program, journal prompts included' },
  { sku:'PROD-073', name:'Cookbook Global Flavors',         cat:'books-media',    cost:14,  price:36.99,  stock:85,  rp:15, desc:'200+ recipes from 30 countries, full color' },
  { sku:'PROD-074', name:'Children\'s Encyclopedia Set',    cat:'books-media',    cost:28,  price:74.99,  stock:55,  rp:10, desc:'5-volume set, ages 8-14, updated 2025' },
  { sku:'PROD-075', name:'Learn Python in 30 Days',         cat:'books-media',    cost:12,  price:32.99,  stock:110, rp:20, desc:'Beginner to intermediate, exercises' },
  { sku:'PROD-076', name:'Vinyl Record Nostalgia 3-Pack',   cat:'books-media',    cost:20,  price:54.99,  stock:60,  rp:10, desc:'Classic jazz collection, 180g pressing' },
  { sku:'PROD-077', name:'Puzzle Notebook Hardbound',       cat:'books-media',    cost:6,   price:16.99,  stock:185, rp:30, desc:'Brain teasers, crosswords, 256 pages' },
  { sku:'PROD-078', name:'Watercolor Painting Kit',         cat:'books-media',    cost:16,  price:42.99,  stock:88,  rp:15, desc:'24 colors, 3 brushes, 2 watercolor pads' },
  { sku:'PROD-079', name:'Language Learning Audio Course',  cat:'books-media',    cost:18,  price:48.99,  stock:75,  rp:12, desc:'Spanish, 10-CD set, 15 hours of content' },
  { sku:'PROD-080', name:'Self-Help Journal Premium',       cat:'books-media',    cost:10,  price:27.99,  stock:140, rp:25, desc:'365-day planner, goal setting, gratitude' },
  // Office Supplies (10)
  { sku:'PROD-081', name:'Ergonomic Desk Chair',            cat:'office-supplies',cost:88,  price:229.99, stock:25,  rp:5,  desc:'Lumbar support, adjustable armrests, mesh back' },
  { sku:'PROD-082', name:'Standing Desk Converter',         cat:'office-supplies',cost:55,  price:149.99, stock:35,  rp:8,  desc:'Gas spring lift, 28-48in height range' },
  { sku:'PROD-083', name:'Wireless Mouse Keyboard Combo',   cat:'office-supplies',cost:28,  price:74.99,  stock:90,  rp:15, desc:'2.4GHz, quiet keys, 12-month battery life' },
  { sku:'PROD-084', name:'Monitor Stand Riser Bamboo',      cat:'office-supplies',cost:18,  price:48.99,  stock:110, rp:20, desc:'Adjustable, drawer storage, cable management' },
  { sku:'PROD-085', name:'Gel Pen Set 24 Colors',           cat:'office-supplies',cost:8,   price:22.99,  stock:200, rp:35, desc:'Glitter, metallic, pastel — smooth flow' },
  { sku:'PROD-086', name:'Desk Organizer Modular',          cat:'office-supplies',cost:14,  price:38.99,  stock:125, rp:20, desc:'6-compartment, cable clips, pen holder' },
  { sku:'PROD-087', name:'Printer Paper 10-Ream Case',      cat:'office-supplies',cost:28,  price:64.99,  stock:80,  rp:15, desc:'8.5x11, 20lb, 5000 sheets, bright white' },
  { sku:'PROD-088', name:'Label Maker Handheld QWERTY',     cat:'office-supplies',cost:20,  price:54.99,  stock:70,  rp:12, desc:'180 dpi, 18 fonts, USB-C charging, 12mm tape' },
  { sku:'PROD-089', name:'Notebook Hardcover A5 3-pack',    cat:'office-supplies',cost:10,  price:26.99,  stock:175, rp:30, desc:'Dot grid, 192 pages each, lay-flat binding' },
  { sku:'PROD-090', name:'Sticky Notes Bulk 24-Pack',       cat:'office-supplies',cost:8,   price:21.99,  stock:220, rp:35, desc:'3x3 in, 6 neon colors, 75 sheets each' },
  // Automotive (10)
  { sku:'PROD-091', name:'Car Dash Cam 4K',                 cat:'automotive',     cost:38,  price:99.99,  stock:65,  rp:12, desc:'Wide angle 170deg, night vision, loop record' },
  { sku:'PROD-092', name:'Tire Inflator Portable 12V',      cat:'automotive',     cost:22,  price:58.99,  stock:88,  rp:15, desc:'Digital pressure gauge, LED light, auto-shutoff' },
  { sku:'PROD-093', name:'Car Phone Mount Magnetic',        cat:'automotive',     cost:8,   price:22.99,  stock:180, rp:30, desc:'Dashboard + vent mount, 360deg rotation' },
  { sku:'PROD-094', name:'Jump Starter Pack 2000A',         cat:'automotive',     cost:45,  price:119.99, stock:40,  rp:10, desc:'12V, USB-A/USB-C, LED flashlight, 8Ah' },
  { sku:'PROD-095', name:'Car Wax Polish Kit',              cat:'automotive',     cost:16,  price:42.99,  stock:110, rp:20, desc:'Carnauba wax, foam pad, microfiber cloth' },
  { sku:'PROD-096', name:'Trunk Organizer Collapsible',     cat:'automotive',     cost:14,  price:38.99,  stock:125, rp:20, desc:'3-section dividers, handles, non-slip base' },
  { sku:'PROD-097', name:'OBD2 Scanner Bluetooth',          cat:'automotive',     cost:22,  price:59.99,  stock:72,  rp:12, desc:'iOS/Android app, full system scan, clear codes' },
  { sku:'PROD-098', name:'Seat Cover Set Neoprene',         cat:'automotive',     cost:35,  price:89.99,  stock:55,  rp:10, desc:'Full 5-seat set, waterproof, airbag compatible' },
  { sku:'PROD-099', name:'Car Air Freshener 6-Pack',        cat:'automotive',     cost:6,   price:16.99,  stock:250, rp:40, desc:'6 scents, 45-day each, vent clip design' },
  { sku:'PROD-100', name:'LED Headlight Bulbs H11 Pair',    cat:'automotive',     cost:18,  price:48.99,  stock:95,  rp:15, desc:'300% brighter, 6000K white, IP68 waterproof' },
]

async function seedCategories() {
  console.log('\n[1/8] Seeding Product Categories...')
  const catMap = {}
  for (const c of CATEGORY_DEFS) {
    try {
      const cat = await prisma.productCategory.upsert({
        where: { slug: c.slug },
        update: {},
        create: { name: c.name, slug: c.slug, color: c.color, icon: c.icon, sortOrder: c.sortOrder, isActive: true }
      })
      catMap[c.slug] = cat.id
    } catch (e) { flag('Category failed: ' + c.slug + ' ' + e.message) }
  }
  const allCats = await prisma.productCategory.findMany()
  for (const c of allCats) catMap[c.slug] = c.id
  SUMMARY['categories'] = allCats.length
  console.log('  Categories: ' + allCats.length)
  return catMap
}

async function seedProducts(catMap, stores) {
  console.log('\n[2/8] Seeding Products (100)...')
  const storeId = stores[0].id
  let created = 0, skipped = 0
  const productIds = []
  for (const p of PRODUCT_DEFS) {
    try {
      const catId = catMap[p.cat] || null
      const prod = await prisma.product.upsert({
        where: { sku: p.sku },
        update: {},
        create: {
          sku: p.sku,
          name: p.name,
          description: p.desc,
          categoryId: catId,
          costPrice: p.cost,
          salePrice: p.price,
          unit: 'each',
          taxable: true,
          trackStock: true,
          isActive: true,
          imageUrl: 'https://picsum.photos/seed/' + p.sku + '/400/400',
          reorderPoint: p.rp,
          reorderQty: p.rp * 2,
        }
      })
      productIds.push({ id: prod.id, sku: prod.sku, price: prod.salePrice, cost: prod.costPrice, name: prod.name })
      await prisma.inventory.upsert({
        where: { productId_storeId: { productId: prod.id, storeId } },
        update: {},
        create: { productId: prod.id, storeId, quantity: p.stock, reserved: 0 }
      })
      created++
    } catch (e) {
      flag('Product failed: ' + p.sku + ' ' + e.message)
      skipped++
    }
  }
  SUMMARY['products'] = created
  console.log('  Products: ' + created + ', skipped: ' + skipped)
  return productIds
}

// ══════════════════════════════════════════════════════════════
// SECTION 2 — Customers (50)
// ══════════════════════════════════════════════════════════════
const CUSTOMER_DEFS = [
  { firstName:'James',     lastName:'Anderson',  email:'james.anderson@gmail.com',    phone:'(206)555-0101', address:'412 Pine St',          city:'Seattle',      state:'WA', zip:'98101', loyaltyPoints:1200, totalSpent:3450.00 },
  { firstName:'Maria',     lastName:'Rodriguez', email:'maria.rodriguez@yahoo.com',   phone:'(323)555-0182', address:'8901 Sunset Blvd',     city:'Los Angeles',  state:'CA', zip:'90046', loyaltyPoints:4500, totalSpent:12000.00 },
  { firstName:'David',     lastName:'Kim',       email:'david.kim@hotmail.com',       phone:'(312)555-0247', address:'300 Michigan Ave',     city:'Chicago',      state:'IL', zip:'60601', loyaltyPoints:875,  totalSpent:2200.50 },
  { firstName:'Ashley',    lastName:'Johnson',   email:'ashley.j@outlook.com',        phone:'(713)555-0319', address:'5500 Westheimer Rd',   city:'Houston',      state:'TX', zip:'77056', loyaltyPoints:2200, totalSpent:6750.00 },
  { firstName:'Michael',   lastName:'Thompson',  email:'m.thompson@gmail.com',        phone:'(602)555-0441', address:'2020 N Central Ave',   city:'Phoenix',      state:'AZ', zip:'85004', loyaltyPoints:310,  totalSpent:890.00 },
  { firstName:'Sarah',     lastName:'Williams',  email:'sarah.williams@icloud.com',   phone:'(215)555-0563', address:'1600 Market St',       city:'Philadelphia', state:'PA', zip:'19103', loyaltyPoints:1750, totalSpent:5100.00 },
  { firstName:'Robert',    lastName:'Davis',     email:'robert.davis@gmail.com',      phone:'(210)555-0672', address:'700 E Market St',      city:'San Antonio',  state:'TX', zip:'78205', loyaltyPoints:620,  totalSpent:1800.00 },
  { firstName:'Jennifer',  lastName:'Martinez',  email:'jen.martinez@yahoo.com',      phone:'(858)555-0784', address:'3300 Sports Arena Blvd',city:'San Diego',   state:'CA', zip:'92110', loyaltyPoints:3100, totalSpent:9200.00 },
  { firstName:'Charles',   lastName:'Wilson',    email:'charles.wilson@gmail.com',    phone:'(214)555-0895', address:'2100 N Stemmons Fwy',  city:'Dallas',       state:'TX', zip:'75207', loyaltyPoints:490,  totalSpent:1350.00 },
  { firstName:'Patricia',  lastName:'Moore',     email:'pat.moore@outlook.com',       phone:'(408)555-0912', address:'400 N First St',       city:'San Jose',     state:'CA', zip:'95112', loyaltyPoints:2800, totalSpent:8400.00 },
  { firstName:'Daniel',    lastName:'Taylor',    email:'d.taylor@gmail.com',          phone:'(512)555-1033', address:'6th St and Congress',  city:'Austin',       state:'TX', zip:'78701', loyaltyPoints:150,  totalSpent:450.00 },
  { firstName:'Linda',     lastName:'Jackson',   email:'linda.jackson@icloud.com',    phone:'(614)555-1145', address:'50 W Broad St',        city:'Columbus',     state:'OH', zip:'43215', loyaltyPoints:1900, totalSpent:5700.00 },
  { firstName:'Mark',      lastName:'White',     email:'mark.white@gmail.com',        phone:'(502)555-1267', address:'400 W Market St',      city:'Louisville',   state:'KY', zip:'40202', loyaltyPoints:730,  totalSpent:2100.00 },
  { firstName:'Barbara',   lastName:'Harris',    email:'barb.harris@yahoo.com',       phone:'(901)555-1388', address:'100 Peabody Pl',       city:'Memphis',      state:'TN', zip:'38103', loyaltyPoints:2400, totalSpent:7200.00 },
  { firstName:'Kevin',     lastName:'Clark',     email:'kevin.clark@hotmail.com',     phone:'(617)555-1491', address:'200 State St',         city:'Boston',       state:'MA', zip:'02109', loyaltyPoints:580,  totalSpent:1650.00 },
  { firstName:'Susan',     lastName:'Lewis',     email:'susan.lewis@gmail.com',       phone:'(404)555-1603', address:'191 Peachtree St NE',  city:'Atlanta',      state:'GA', zip:'30303', loyaltyPoints:1100, totalSpent:3300.00 },
  { firstName:'Thomas',    lastName:'Lee',       email:'tom.lee@outlook.com',         phone:'(202)555-1714', address:'800 F St NW',          city:'Washington',   state:'DC', zip:'20004', loyaltyPoints:3500, totalSpent:10500.00 },
  { firstName:'Karen',     lastName:'Walker',    email:'karen.walker@icloud.com',     phone:'(617)555-1825', address:'100 Cambridge St',     city:'Cambridge',    state:'MA', zip:'02139', loyaltyPoints:240,  totalSpent:720.00 },
  { firstName:'Jason',     lastName:'Hall',      email:'jason.hall@gmail.com',        phone:'(303)555-1936', address:'16th Street Mall',     city:'Denver',       state:'CO', zip:'80202', loyaltyPoints:1680, totalSpent:5040.00 },
  { firstName:'Lisa',      lastName:'Allen',     email:'lisa.allen@yahoo.com',        phone:'(702)555-2047', address:'3570 Las Vegas Blvd',  city:'Las Vegas',    state:'NV', zip:'89109', loyaltyPoints:4200, totalSpent:12600.00 },
  { firstName:'Steven',    lastName:'Young',     email:'s.young@gmail.com',           phone:'(816)555-2158', address:'2345 Grand Blvd',      city:'Kansas City',  state:'MO', zip:'64108', loyaltyPoints:390,  totalSpent:1170.00 },
  { firstName:'Nancy',     lastName:'Hernandez', email:'nancy.h@outlook.com',         phone:'(415)555-2269', address:'1 Market St',          city:'San Francisco',state:'CA', zip:'94105', loyaltyPoints:2100, totalSpent:6300.00 },
  { firstName:'Andrew',    lastName:'King',      email:'andrew.king@gmail.com',       phone:'(503)555-2380', address:'1000 SW Broadway',     city:'Portland',     state:'OR', zip:'97205', loyaltyPoints:780,  totalSpent:2340.00 },
  { firstName:'Betty',     lastName:'Wright',    email:'betty.wright@icloud.com',     phone:'(612)555-2491', address:'600 Hennepin Ave',     city:'Minneapolis',  state:'MN', zip:'55403', loyaltyPoints:1350, totalSpent:4050.00 },
  { firstName:'George',    lastName:'Lopez',     email:'george.lopez@yahoo.com',      phone:'(714)555-2602', address:'2500 E Katella Ave',   city:'Anaheim',      state:'CA', zip:'92806', loyaltyPoints:2700, totalSpent:8100.00 },
  { firstName:'Dorothy',   lastName:'Hill',      email:'dorothy.hill@gmail.com',      phone:'(423)555-2713', address:'100 E Martin Luther King Blvd',city:'Chattanooga',state:'TN',zip:'37402',loyaltyPoints:460,totalSpent:1380.00 },
  { firstName:'Paul',      lastName:'Scott',     email:'paul.scott@hotmail.com',      phone:'(505)555-2824', address:'500 Marquette Ave NW', city:'Albuquerque',  state:'NM', zip:'87102', loyaltyPoints:1800, totalSpent:5400.00 },
  { firstName:'Sandra',    lastName:'Green',     email:'sandra.green@outlook.com',    phone:'(520)555-2935', address:'100 S Church Ave',     city:'Tucson',       state:'AZ', zip:'85701', loyaltyPoints:560,  totalSpent:1680.00 },
  { firstName:'Joshua',    lastName:'Baker',     email:'josh.baker@gmail.com',        phone:'(918)555-3046', address:'100 W 5th St',         city:'Tulsa',        state:'OK', zip:'74103', loyaltyPoints:920,  totalSpent:2760.00 },
  { firstName:'Sharon',    lastName:'Adams',     email:'sharon.adams@icloud.com',     phone:'(402)555-3157', address:'1111 Douglas St',      city:'Omaha',        state:'NE', zip:'68102', loyaltyPoints:3300, totalSpent:9900.00 },
  { firstName:'Ryan',      lastName:'Nelson',    email:'ryan.nelson@gmail.com',       phone:'(860)555-3268', address:'100 Constitution Plaza',city:'Hartford',    state:'CT', zip:'06103', loyaltyPoints:690,  totalSpent:2070.00 },
  { firstName:'Melissa',   lastName:'Carter',    email:'melissa.c@yahoo.com',         phone:'(405)555-3379', address:'200 N Walker Ave',     city:'Oklahoma City',state:'OK', zip:'73102', loyaltyPoints:1450, totalSpent:4350.00 },
  { firstName:'Eric',      lastName:'Mitchell',  email:'eric.mitchell@gmail.com',     phone:'(901)555-3490', address:'149 Union Ave',        city:'Memphis',      state:'TN', zip:'38103', loyaltyPoints:280,  totalSpent:840.00 },
  { firstName:'Amanda',    lastName:'Perez',     email:'amanda.perez@outlook.com',    phone:'(786)555-3601', address:'800 Brickell Ave',     city:'Miami',        state:'FL', zip:'33131', loyaltyPoints:2600, totalSpent:7800.00 },
  { firstName:'Douglas',   lastName:'Roberts',   email:'d.roberts@gmail.com',         phone:'(904)555-3712', address:'220 Riverside Ave',    city:'Jacksonville', state:'FL', zip:'32202', loyaltyPoints:840,  totalSpent:2520.00 },
  { firstName:'Michelle',  lastName:'Turner',    email:'michelle.t@icloud.com',       phone:'(704)555-3823', address:'100 N Tryon St',       city:'Charlotte',    state:'NC', zip:'28202', loyaltyPoints:1620, totalSpent:4860.00 },
  { firstName:'Frank',     lastName:'Phillips',  email:'frank.phillips@yahoo.com',    phone:'(804)555-3934', address:'701 E Byrd St',        city:'Richmond',     state:'VA', zip:'23219', loyaltyPoints:370,  totalSpent:1110.00 },
  { firstName:'Donna',     lastName:'Campbell',  email:'donna.c@gmail.com',           phone:'(317)555-4045', address:'49 W Washington St',   city:'Indianapolis', state:'IN', zip:'46204', loyaltyPoints:2000, totalSpent:6000.00 },
  { firstName:'Gary',      lastName:'Parker',    email:'gary.parker@hotmail.com',     phone:'(615)555-4156', address:'500 Broadway',         city:'Nashville',    state:'TN', zip:'37203', loyaltyPoints:1250, totalSpent:3750.00 },
  { firstName:'Carol',     lastName:'Evans',     email:'carol.evans@outlook.com',     phone:'(414)555-4267', address:'500 W Wisconsin Ave',  city:'Milwaukee',    state:'WI', zip:'53203', loyaltyPoints:790,  totalSpent:2370.00 },
  { firstName:'Timothy',   lastName:'Edwards',   email:'tim.edwards@gmail.com',       phone:'(505)555-4378', address:'302 Gold Ave SW',      city:'Albuquerque',  state:'NM', zip:'87102', loyaltyPoints:1900, totalSpent:5700.00 },
  { firstName:'Helen',     lastName:'Collins',   email:'helen.collins@icloud.com',    phone:'(314)555-4489', address:'815 Olive St',         city:'St. Louis',    state:'MO', zip:'63101', loyaltyPoints:480,  totalSpent:1440.00 },
  { firstName:'Brian',     lastName:'Stewart',   email:'brian.s@gmail.com',           phone:'(501)555-4590', address:'1 Capitol Ave',        city:'Little Rock',  state:'AR', zip:'72201', loyaltyPoints:3700, totalSpent:11100.00 },
  { firstName:'Angela',    lastName:'Sanchez',   email:'angela.sanchez@yahoo.com',    phone:'(505)555-4701', address:'214 Central Ave SW',   city:'Albuquerque',  state:'NM', zip:'87102', loyaltyPoints:660,  totalSpent:1980.00 },
  { firstName:'Ronald',    lastName:'Morris',    email:'ronald.m@outlook.com',        phone:'(801)555-4812', address:'350 S Main St',        city:'Salt Lake City',state:'UT',zip:'84101', loyaltyPoints:1400, totalSpent:4200.00 },
  { firstName:'Deborah',   lastName:'Rogers',    email:'deborah.r@gmail.com',         phone:'(907)555-4923', address:'123 W 3rd Ave',        city:'Anchorage',    state:'AK', zip:'99501', loyaltyPoints:980,  totalSpent:2940.00 },
  { firstName:'Joe',       lastName:'Reed',      email:'joe.reed@icloud.com',         phone:'(808)555-5034', address:'100 N Beretania St',   city:'Honolulu',     state:'HI', zip:'96817', loyaltyPoints:2900, totalSpent:8700.00 },
  { firstName:'Christina', lastName:'Cook',      email:'christina.cook@gmail.com',    phone:'(207)555-5145', address:'1 City Center',        city:'Portland',     state:'ME', zip:'04101', loyaltyPoints:420,  totalSpent:1260.00 },
  { firstName:'Jonathan',  lastName:'Morgan',    email:'j.morgan@yahoo.com',          phone:'(802)555-5256', address:'100 State St',         city:'Montpelier',   state:'VT', zip:'05602', loyaltyPoints:1700, totalSpent:5100.00 },
  { firstName:'Stephanie', lastName:'Bell',      email:'steph.bell@outlook.com',      phone:'(603)555-5367', address:'1 Granite Sq',         city:'Concord',      state:'NH', zip:'03301', loyaltyPoints:550,  totalSpent:1650.00 },
]

async function seedCustomers() {
  console.log('\n[3/8] Seeding Customers (50)...')
  let created = 0, skipped = 0
  const customerIds = []
  for (const c of CUSTOMER_DEFS) {
    try {
      const cust = await prisma.customer.upsert({
        where: { email: c.email },
        update: {},
        create: {
          firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone,
          address: c.address, city: c.city, state: c.state, zip: c.zip,
          loyaltyPoints: c.loyaltyPoints, totalSpent: c.totalSpent,
          visitCount: rnd(1, 50), isActive: true,
          creditLimit: pick([0, 500, 1000, 2000, 5000]), creditStatus: 'good',
        }
      })
      customerIds.push(cust.id)
      created++
    } catch (e) {
      flag('Customer failed: ' + c.email + ' ' + e.message)
      skipped++
    }
  }
  SUMMARY['customers'] = created
  console.log('  Customers: ' + created + ', skipped: ' + skipped)
  return customerIds
}

// ══════════════════════════════════════════════════════════════
// SECTION 3 — Employees (15)
// ══════════════════════════════════════════════════════════════
const EMPLOYEE_DEFS = [
  { email:'alex.morgan@novapos.com',   firstName:'Alex',     lastName:'Morgan',   role:'manager',   position:'Store Manager',       dept:'Management', hourlyRate:32.00 },
  { email:'sarah.chen@novapos.com',    firstName:'Sarah',    lastName:'Chen',     role:'manager',   position:'Assistant Manager',   dept:'Management', hourlyRate:26.00 },
  { email:'mike.ross@novapos.com',     firstName:'Mike',     lastName:'Ross',     role:'manager',   position:'Operations Manager',  dept:'Management', hourlyRate:28.00 },
  { email:'emily.clark@novapos.com',   firstName:'Emily',    lastName:'Clark',    role:'cashier',   position:'Lead Cashier',        dept:'Sales',      hourlyRate:18.00 },
  { email:'carlos.reyes@novapos.com',  firstName:'Carlos',   lastName:'Reyes',    role:'cashier',   position:'Cashier',             dept:'Sales',      hourlyRate:16.00 },
  { email:'jessica.wu@novapos.com',    firstName:'Jessica',  lastName:'Wu',       role:'cashier',   position:'Cashier',             dept:'Sales',      hourlyRate:16.00 },
  { email:'brandon.lee@novapos.com',   firstName:'Brandon',  lastName:'Lee',      role:'cashier',   position:'Cashier',             dept:'Sales',      hourlyRate:16.00 },
  { email:'nina.patel@novapos.com',    firstName:'Nina',     lastName:'Patel',    role:'cashier',   position:'Cashier',             dept:'Sales',      hourlyRate:17.00 },
  { email:'tom.garcia@novapos.com',    firstName:'Tom',      lastName:'Garcia',   role:'warehouse', position:'Warehouse Lead',      dept:'Warehouse',  hourlyRate:20.00 },
  { email:'amy.johnson@novapos.com',   firstName:'Amy',      lastName:'Johnson',  role:'warehouse', position:'Warehouse Associate', dept:'Warehouse',  hourlyRate:17.00 },
  { email:'james.kim@novapos.com',     firstName:'James',    lastName:'Kim',      role:'warehouse', position:'Warehouse Associate', dept:'Warehouse',  hourlyRate:17.00 },
  { email:'priya.sharma@novapos.com',  firstName:'Priya',    lastName:'Sharma',   role:'warehouse', position:'Receiving Clerk',     dept:'Warehouse',  hourlyRate:17.50 },
  { email:'dave.white@novapos.com',    firstName:'Dave',     lastName:'White',    role:'accountant',position:'Accountant',          dept:'Finance',    hourlyRate:30.00 },
  { email:'lisa.brown@novapos.com',    firstName:'Lisa',     lastName:'Brown',    role:'accountant',position:'Accounts Payable',    dept:'Finance',    hourlyRate:25.00 },
  { email:'admin@novapos.com',         firstName:'System',   lastName:'Admin',    role:'admin',     position:'System Administrator',dept:'IT',         hourlyRate:40.00 },
]

async function seedEmployees(stores) {
  console.log('\n[4/8] Seeding Employees (15)...')
  const storeId = stores[0].id
  let created = 0, skipped = 0
  for (var i = 0; i < EMPLOYEE_DEFS.length; i++) {
    var e = EMPLOYEE_DEFS[i]
    try {
      var user = await prisma.user.upsert({
        where: { email: e.email },
        update: {},
        create: { email: e.email, name: e.firstName + ' ' + e.lastName, role: e.role, passwordHash: '$2a$12$demo_hash_placeholder', isActive: true }
      })
      await prisma.employee.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id, storeId,
          firstName: e.firstName, lastName: e.lastName, position: e.position, department: e.dept,
          hireDate: daysAgo(rnd(90, 1000)), hourlyRate: e.hourlyRate, isActive: true,
        }
      })
      created++
    } catch (err) {
      flag('Employee failed: ' + e.email + ' ' + err.message)
      skipped++
    }
  }
  SUMMARY['employees'] = created
  console.log('  Employees: ' + created + ', skipped: ' + skipped)
}

// ══════════════════════════════════════════════════════════════
// SECTION 4 — Vendors (20 BC Vendors) + Suppliers (20)
// ══════════════════════════════════════════════════════════════
const VENDOR_DEFS = [
  { code:'VEN-001', name:'TechSource Global Inc.',          contact:'Brad Collins',   email:'orders@techsource.io',     phone:'(888)555-2200', address:'1200 Tech Blvd',         city:'Redmond',       state:'WA', zip:'98052', terms:'Net45', method:'ACH'   },
  { code:'VEN-002', name:'Pacific Northwest Distributors',  contact:'Lori Swanson',   email:'orders@pnwdist.com',       phone:'(206)800-1001', address:'500 Industrial Way',     city:'Auburn',        state:'WA', zip:'98001', terms:'Net30', method:'Check' },
  { code:'VEN-003', name:'Cascade Food and Beverage Co.',   contact:'Marcus Tran',    email:'supply@cascadefb.com',     phone:'(253)555-3310', address:'88 Valley Rd',           city:'Kent',          state:'WA', zip:'98032', terms:'Net15', method:'ACH'   },
  { code:'VEN-004', name:'Summit Apparel Wholesale',        contact:'Dana Kessler',   email:'wholesale@summitapp.com',  phone:'(425)555-4420', address:'2201 Commerce Pkwy',     city:'Lynnwood',      state:'WA', zip:'98036', terms:'Net30', method:'Check' },
  { code:'VEN-005', name:'HomePro Supply Chain',            contact:'Victor Ruiz',    email:'supply@homepro.net',       phone:'(360)555-5531', address:'4400 Harbor Blvd',       city:'Everett',       state:'WA', zip:'98203', terms:'Net30', method:'Wire'  },
  { code:'VEN-006', name:'FitLife Sports Distributors',     contact:'Alicia Monroe',  email:'orders@fitlifedist.com',   phone:'(206)555-6642', address:'9900 Eastside Dr',       city:'Bellevue',      state:'WA', zip:'98007', terms:'Net60', method:'ACH'   },
  { code:'VEN-007', name:'Glow Beauty Supply',              contact:'Natasha Reed',   email:'orders@glowbeauty.com',    phone:'(425)555-7753', address:'310 Rose St Ste 12',     city:'Kirkland',      state:'WA', zip:'98034', terms:'Net15', method:'Check' },
  { code:'VEN-008', name:'Rainier Specialty Imports',       contact:'Henry Chu',      email:'hello@rainierimports.com', phone:'(206)555-8864', address:'1717 Western Ave',       city:'Seattle',       state:'WA', zip:'98101', terms:'Net30', method:'Wire'  },
  { code:'VEN-009', name:'Global Toy Makers Ltd.',          contact:'Jenny Walsh',    email:'orders@globaltoys.com',    phone:'(800)555-9001', address:'200 Industrial Park Dr', city:'Carson',        state:'CA', zip:'90745', terms:'Net45', method:'ACH'   },
  { code:'VEN-010', name:'BookWorld Distribution',          contact:'Samuel Pine',    email:'orders@bookworld.com',     phone:'(212)555-0110', address:'100 Park Ave',           city:'New York',      state:'NY', zip:'10017', terms:'Net30', method:'Check' },
  { code:'VEN-011', name:'AutoParts Direct USA',            contact:'Rick Vasquez',   email:'supply@autoparts.com',     phone:'(888)555-1122', address:'5000 Auto Blvd',         city:'Detroit',       state:'MI', zip:'48201', terms:'Net30', method:'ACH'   },
  { code:'VEN-012', name:'Organic Valley Co-op',            contact:'Claire Foster',  email:'orders@organicvalley.com', phone:'(800)555-2233', address:'One Organic Way',        city:'La Farge',      state:'WI', zip:'54639', terms:'Net15', method:'Check' },
  { code:'VEN-013', name:'Premier Office Products',         contact:'Dennis Harmon',  email:'supply@premieroffice.com', phone:'(800)555-3344', address:'777 Office Plaza',       city:'Chicago',       state:'IL', zip:'60601', terms:'Net30', method:'ACH'   },
  { code:'VEN-014', name:'Natures Best Supplements',        contact:'Amy Chen',       email:'orders@naturesbest.com',   phone:'(800)555-4455', address:'2000 Health Blvd',       city:'Scottsdale',    state:'AZ', zip:'85254', terms:'Net30', method:'Wire'  },
  { code:'VEN-015', name:'Coastal Garden Supply',           contact:'Jack Navarro',   email:'orders@coastalgarden.com', phone:'(800)555-5566', address:'100 Garden Way',         city:'Ventura',       state:'CA', zip:'93001', terms:'Net45', method:'Check' },
  { code:'VEN-016', name:'MidWest Electronics Wholesale',   contact:'Pam Elliott',    email:'supply@mwelex.com',        phone:'(800)555-6677', address:'400 Midwest Pkwy',       city:'Columbus',      state:'OH', zip:'43215', terms:'Net30', method:'ACH'   },
  { code:'VEN-017', name:'Southern Snack Distributors',     contact:'Tommy Landry',   email:'orders@southernsnack.com', phone:'(800)555-7788', address:'3000 Peachtree Rd',      city:'Atlanta',       state:'GA', zip:'30309', terms:'Net15', method:'Check' },
  { code:'VEN-018', name:'Rocky Mountain Sporting Goods',   contact:'Karen Frost',    email:'supply@rockymtsport.com',  phone:'(800)555-8899', address:'1500 Mountain Rd',       city:'Denver',        state:'CO', zip:'80202', terms:'Net45', method:'ACH'   },
  { code:'VEN-019', name:'Digital Media Wholesale',         contact:'Leo Santiago',   email:'orders@digitalmedia.com',  phone:'(800)555-9900', address:'555 Digital Blvd',       city:'Austin',        state:'TX', zip:'78701', terms:'Net30', method:'Wire'  },
  { code:'VEN-020', name:'National Brand Liquidators',      contact:'Faye Nichols',   email:'supply@nbliq.com',         phone:'(800)555-0011', address:'9000 Commerce Way',      city:'Memphis',       state:'TN', zip:'38108', terms:'Net30', method:'Check' },
]

async function seedVendors() {
  console.log('\n[5/8] Seeding Vendors (20) + Suppliers (20)...')
  let vendCreated = 0, supCreated = 0, skipped = 0
  var vendorIds = []
  var supplierIds = []

  // VendorGroup
  var vg = null
  try {
    vg = await prisma.vendorGroup.upsert({
      where: { code: 'GEN' },
      update: {},
      create: { code: 'GEN', name: 'General Vendors', defaultPayTerms: 'Net30' }
    })
  } catch (e) { flag('VendorGroup failed: ' + e.message) }

  for (var i = 0; i < VENDOR_DEFS.length; i++) {
    var v = VENDOR_DEFS[i]

    // BC Vendor
    try {
      var createData = {
        vendorCode: v.code,
        name: v.name,
        email: v.email,
        phone: v.phone,
        address: v.address,
        city: v.city,
        state: v.state,
        zip: v.zip,
        paymentTerms: v.terms,
        paymentMethod: v.method,
        currency: 'USD',
        creditLimit: pick([10000, 25000, 50000, 100000]),
        isActive: true,
      }
      if (vg) { createData.vendorGroup = { connect: { id: vg.id } } }
      var vendor = await prisma.vendor.upsert({
        where: { vendorCode: v.code },
        update: {},
        create: createData,
      })
      vendorIds.push(vendor.id)
      vendCreated++
    } catch (e) {
      flag('Vendor failed: ' + v.code + ' ' + e.message)
      skipped++
    }

    // Supplier (for POs)
    try {
      var existing = await prisma.supplier.findFirst({ where: { email: v.email } })
      if (!existing) {
        var sup = await prisma.supplier.create({
          data: {
            name: v.name,
            contactName: v.contact,
            email: v.email,
            phone: v.phone,
            address: v.address,
            city: v.city,
            state: v.state,
            zip: v.zip,
            paymentTerms: v.terms,
            isActive: true,
          }
        })
        supplierIds.push(sup.id)
      } else {
        supplierIds.push(existing.id)
      }
      supCreated++
    } catch (e) {
      flag('Supplier failed for ' + v.code + ': ' + e.message)
    }
  }

  SUMMARY['vendors'] = vendCreated
  SUMMARY['suppliers'] = supCreated
  console.log('  Vendors: ' + vendCreated + ', Suppliers: ' + supCreated + ', skipped: ' + skipped)
  return { vendorIds: vendorIds, supplierIds: supplierIds }
}

// ══════════════════════════════════════════════════════════════
// SECTION 5 — Gift Cards (25)
// ══════════════════════════════════════════════════════════════
async function seedGiftCards() {
  console.log('\n[6/8] Seeding Gift Cards (25)...')
  var created = 0, skipped = 0
  var denoms = [10, 25, 50, 100]
  var statuses = ['active','active','active','redeemed','expired']

  for (var i = 1; i <= 25; i++) {
    var num = 'GC-2026-' + String(i).padStart(4,'0')
    var initial = pick(denoms)
    var status = pick(statuses)
    var current = (status === 'redeemed' || status === 'expired') ? 0 : randFloat(0, initial)
    try {
      await prisma.giftCardLegacy.upsert({
        where: { cardNumber: num },
        update: {},
        create: {
          cardNumber: num,
          initialBalance: initial,
          currentBalance: current,
          currency: 'USD',
          status: status,
          issuedAt: daysAgo(rnd(10, 180)),
          expiresAt: status === 'expired' ? daysAgo(rnd(1,30)) : new Date(new Date().setFullYear(new Date().getFullYear()+1)),
          notes: 'Demo gift card - ' + status,
        }
      })
      created++
    } catch (e) {
      flag('GiftCard failed: ' + num + ' ' + e.message)
      skipped++
    }
  }
  SUMMARY['giftCards'] = created
  console.log('  Gift Cards: ' + created + ', skipped: ' + skipped)
}

// ══════════════════════════════════════════════════════════════
// SECTION 6 — Loyalty Programs + Cards
// ══════════════════════════════════════════════════════════════
async function seedLoyalty(customerIds) {
  console.log('\n[7/8] Seeding Loyalty Programs + Cards...')
  var programsCreated = 0, cardsCreated = 0
  var programs = []
  var programDefs = [
    { name:'Bronze Rewards', desc:'Earn 1 point per dollar spent', tierName:'Bronze', minPts:0,    rate:1.0, color:'#cd7f32' },
    { name:'Silver Circle',  desc:'Earn 1.5 points per dollar',    tierName:'Silver', minPts:500,  rate:1.5, color:'#c0c0c0' },
    { name:'Gold Elite',     desc:'Earn 2x points + rewards',      tierName:'Gold',   minPts:2000, rate:2.0, color:'#ffd700' },
  ]

  for (var i = 0; i < programDefs.length; i++) {
    var pd = programDefs[i]
    try {
      var prog = await prisma.loyaltyProgram.create({
        data: { name: pd.name, description: pd.desc, status: 'active', startDate: daysAgo(365) }
      })
      await prisma.loyaltyTierLegacy.create({
        data: { programId: prog.id, name: pd.tierName, minimumPoints: pd.minPts, earningRate: pd.rate, rewardRate: 0.01, color: pd.color }
      })
      programs.push(prog)
      programsCreated++
    } catch (e) { flag('LoyaltyProgram failed: ' + pd.name + ' ' + e.message) }
  }

  // Enroll first 20 customers
  var toEnroll = customerIds.slice(0, 20)
  for (var j = 0; j < toEnroll.length; j++) {
    var custId = toEnroll[j]
    var prog2 = programs[j % programs.length]
    if (!prog2) continue
    try {
      var tiers2 = await prisma.loyaltyTierLegacy.findMany({ where: { programId: prog2.id } })
      var tier = tiers2[0]
      var pts = rnd(0, 3000)
      await prisma.loyaltyCard.upsert({
        where: { customerId: custId },
        update: {},
        create: {
          cardNumber: 'LC-' + String(j+1).padStart(5,'0'),
          programId: prog2.id,
          tierId: tier ? tier.id : null,
          customerId: custId,
          totalPoints: pts,
          availablePoints: pts,
          lifetimePoints: pts + rnd(0, 1000),
          status: 'active',
          enrolledAt: daysAgo(rnd(30, 365)),
        }
      })
      cardsCreated++
    } catch (e) { flag('LoyaltyCard failed: ' + e.message) }
  }

  SUMMARY['loyaltyPrograms'] = programsCreated
  SUMMARY['loyaltyCards'] = cardsCreated
  console.log('  Programs: ' + programsCreated + ', Cards: ' + cardsCreated)
}

// ══════════════════════════════════════════════════════════════
// SECTION 7 — Orders (110 transactions)
// ══════════════════════════════════════════════════════════════
async function seedOrders(stores, customerIds, productIds) {
  console.log('\n[8/8] Seeding Orders (110 transactions)...')
  var storeId = stores[0].id
  var created = 0, skipped = 0
  var payMethods = ['cash','credit_card','debit_card','gift_card','mobile_pay']
  var statuses = ['completed','completed','completed','completed','returned','voided']

  // Check existing order count to avoid re-seeding
  var existingCount = await prisma.order.count()
  if (existingCount >= 100) {
    console.log('  Orders already seeded (' + existingCount + ' exist), skipping.')
    SUMMARY['orders'] = existingCount
    return
  }

  for (var i = 1; i <= 110; i++) {
    var orderNum = 'ORD-2026-' + String(i).padStart(5,'0')
    var status = pick(statuses)
    var custId = Math.random() < 0.7 ? pick(customerIds) : null
    var numItems = rnd(1, 5)
    var items = []
    var subtotal = 0

    var shuffled = productIds.slice().sort(function() { return 0.5 - Math.random() })
    for (var j = 0; j < numItems && j < shuffled.length; j++) {
      var prod = shuffled[j]
      var qty = rnd(1, 3)
      var price = prod.price
      var discount = Math.random() < 0.15 ? parseFloat((price * pick([0.05, 0.10, 0.15])).toFixed(2)) : 0
      var lineTotal = parseFloat(((price - discount) * qty).toFixed(2))
      var taxAmt = parseFloat((lineTotal * 0.0825).toFixed(2))
      subtotal += lineTotal
      items.push({ prod: prod, qty: qty, price: price, discount: discount, lineTotal: lineTotal, taxAmt: taxAmt })
    }

    var taxAmount = parseFloat((subtotal * 0.0825).toFixed(2))
    var totalAmount = parseFloat((subtotal + taxAmount).toFixed(2))
    var paymentMethod = pick(payMethods)
    var orderDate = daysAgo(rnd(0, 90))

    try {
      var orderData = {
        orderNumber: orderNum,
        storeId: storeId,
        customerId: custId,
        status: status,
        subtotal: parseFloat(subtotal.toFixed(2)),
        taxAmount: taxAmount,
        discountAmount: parseFloat(items.reduce(function(s,it) { return s + it.discount * it.qty }, 0).toFixed(2)),
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        amountTendered: status !== 'voided' ? totalAmount : null,
        changeDue: 0,
        notes: status === 'returned' ? 'Customer return - full refund' : null,
        createdAt: orderDate,
        updatedAt: orderDate,
        items: {
          create: items.map(function(it) {
            return {
              productId: it.prod.id, productName: it.prod.name, sku: it.prod.sku,
              quantity: it.qty, unitPrice: it.price, discount: it.discount,
              taxAmount: it.taxAmt, lineTotal: it.lineTotal,
            }
          })
        },
      }
      if (status !== 'voided') {
        orderData.payments = {
          create: [{ method: paymentMethod, amount: totalAmount, status: 'completed', createdAt: orderDate }]
        }
      }
      await prisma.order.create({ data: orderData })
      created++
    } catch (e) {
      flag('Order failed: ' + orderNum + ' ' + e.message.slice(0, 100))
      skipped++
    }
  }
  SUMMARY['orders'] = created
  console.log('  Orders: ' + created + ', skipped: ' + skipped)
}

// ══════════════════════════════════════════════════════════════
// SECTION 8a — Purchase Orders (10)
// ══════════════════════════════════════════════════════════════
async function seedPurchaseOrders(stores, supplierIds, productIds) {
  console.log('\n[9/8] Seeding Purchase Orders (10)...')
  var storeId = stores[0].id
  var poStatuses = ['open','open','received','received','received','cancelled']
  var created = 0, skipped = 0

  if (!supplierIds || supplierIds.length === 0) {
    flag('No supplier IDs - skipping Purchase Orders')
    SUMMARY['purchaseOrders'] = 0
    return
  }

  // Check existing POs
  var existingPOs = await prisma.purchaseOrder.count()
  if (existingPOs >= 10) {
    console.log('  POs already seeded (' + existingPOs + ' exist), skipping.')
    SUMMARY['purchaseOrders'] = existingPOs
    return
  }

  for (var i = 1; i <= 10; i++) {
    var poNum = 'PO-2026-' + String(i).padStart(4,'0')
    var supplierId = pick(supplierIds)
    var status = pick(poStatuses)
    var numLines = rnd(2, 6)
    var lines = []
    var subtotal = 0
    var shuffled = productIds.slice().sort(function() { return 0.5 - Math.random() })
    for (var j = 0; j < numLines && j < shuffled.length; j++) {
      var prod = shuffled[j]
      var qty = rnd(10, 100)
      var unitCost = prod.cost
      var lineTotal = parseFloat((qty * unitCost).toFixed(2))
      subtotal += lineTotal
      lines.push({ prod: prod, qty: qty, unitCost: unitCost, lineTotal: lineTotal })
    }
    var totalAmount = parseFloat(subtotal.toFixed(2))
    var expectedDate = new Date(); expectedDate.setDate(expectedDate.getDate() + rnd(7, 30))
    var receivedDate = status === 'received' ? daysAgo(rnd(1, 30)) : null

    try {
      await prisma.purchaseOrder.create({
        data: {
          poNumber: poNum,
          supplierId: supplierId,
          storeId: storeId,
          status: status,
          subtotal: parseFloat(subtotal.toFixed(2)),
          taxAmount: 0,
          shippingCost: rnd(0, 200),
          totalAmount: totalAmount,
          expectedDate: expectedDate,
          receivedDate: receivedDate,
          notes: 'Demo PO - ' + status,
          createdBy: 'seed-script',
          items: {
            create: lines.map(function(l) {
              return {
                productId: l.prod.id, productName: l.prod.name, sku: l.prod.sku,
                orderedQty: l.qty, receivedQty: status === 'received' ? l.qty : 0,
                unitCost: l.unitCost, lineTotal: l.lineTotal,
              }
            })
          }
        }
      })
      created++
    } catch (e) {
      flag('PurchaseOrder failed: ' + poNum + ' ' + e.message.slice(0,100))
      skipped++
    }
  }
  SUMMARY['purchaseOrders'] = created
  console.log('  Purchase Orders: ' + created + ', skipped: ' + skipped)
}

// ══════════════════════════════════════════════════════════════
// SECTION 8b — Invoices: 20 AR + 15 AP
// ══════════════════════════════════════════════════════════════
async function seedInvoices(customerIds, vendorIds) {
  console.log('\n[10/8] Seeding Invoices (20 AR + 15 AP)...')
  var arCreated = 0, apCreated = 0, skipped = 0

  // AR — Customer Invoices
  var arStatuses = ['posted','posted','paid','paid','partial','draft']
  for (var i = 1; i <= 20; i++) {
    var invNum = 'INV-AR-2026-' + String(i).padStart(4,'0')
    var custId = pick(customerIds)
    if (!custId) { flag('No customer for AR invoice'); continue }
    var status = pick(arStatuses)
    var subtotal = randFloat(50, 2500)
    var tax = parseFloat((subtotal * 0.0825).toFixed(2))
    var total = parseFloat((subtotal + tax).toFixed(2))
    var paid = status === 'paid' ? total : status === 'partial' ? parseFloat((total * randFloat(0.3, 0.8)).toFixed(2)) : 0
    var invoiceDate = daysAgo(rnd(1, 60))
    var dueDate = new Date(invoiceDate); dueDate.setDate(dueDate.getDate() + 30)
    try {
      await prisma.customerInvoice.upsert({
        where: { invoiceNumber: invNum },
        update: {},
        create: {
          invoiceNumber: invNum, customerId: custId, invoiceDate: invoiceDate, dueDate: dueDate,
          subtotal: subtotal, taxAmount: tax, totalAmount: total, paidAmount: paid,
          status: status, invoiceType: 'sales',
          notes: 'Demo AR Invoice - ' + status,
          lines: { create: [{ description: 'Products/Services - ' + invNum, quantity: 1, unitPrice: subtotal, lineAmount: subtotal, taxAmount: tax }] }
        }
      })
      arCreated++
    } catch (e) {
      flag('CustomerInvoice failed: ' + invNum + ' ' + e.message.slice(0,80))
      skipped++
    }
  }

  // AP — Vendor Invoices
  if (!vendorIds || vendorIds.length === 0) {
    flag('No vendor IDs for AP invoices — skipping')
  } else {
    var apStatuses = ['posted','posted','paid','paid','partial','matched']
    for (var k = 1; k <= 15; k++) {
      var apNum = 'INV-AP-2026-' + String(k).padStart(4,'0')
      var vendId = pick(vendorIds)
      var apStatus = pick(apStatuses)
      var apSubtotal = randFloat(200, 15000)
      var apTotal = apSubtotal
      var apPaid = apStatus === 'paid' ? apTotal : apStatus === 'partial' ? parseFloat((apTotal * randFloat(0.3,0.8)).toFixed(2)) : 0
      var apInvDate = daysAgo(rnd(1, 90))
      var apDueDate = new Date(apInvDate); apDueDate.setDate(apDueDate.getDate() + 30)
      try {
        await prisma.vendorInvoice.upsert({
          where: { invoiceNumber: apNum },
          update: {},
          create: {
            invoiceNumber: apNum, vendorId: vendId, invoiceDate: apInvDate, dueDate: apDueDate,
            subtotal: apSubtotal, taxAmount: 0, totalAmount: apTotal, paidAmount: apPaid,
            status: apStatus, matchingStatus: apStatus === 'matched' ? 'two_way' : 'none',
            notes: 'Demo AP Invoice - ' + apStatus,
            lines: { create: [{ description: 'Inventory purchase - ' + apNum, quantity: rnd(5,50), unitPrice: parseFloat((apSubtotal/10).toFixed(2)), lineAmount: apSubtotal, taxAmount: 0 }] }
          }
        })
        apCreated++
      } catch (e) {
        flag('VendorInvoice failed: ' + apNum + ' ' + e.message.slice(0,80))
        skipped++
      }
    }
  }

  SUMMARY['arInvoices'] = arCreated
  SUMMARY['apInvoices'] = apCreated
  console.log('  AR Invoices: ' + arCreated + ', AP Invoices: ' + apCreated + ', skipped: ' + skipped)
}

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════
async function main() {
  console.log('=== NovaPOS Full Demo Seed ===')
  console.log('Started: ' + new Date().toISOString())

  try {
    var stores = await getStores()
    console.log('Stores: ' + stores.map(function(s) { return s.name }).join(', '))

    var catMap = await seedCategories()
    var productIds = await seedProducts(catMap, stores)
    var customerIds = await seedCustomers()
    await seedEmployees(stores)
    var vendorResult = await seedVendors()
    await seedGiftCards()
    await seedLoyalty(customerIds)
    await seedOrders(stores, customerIds, productIds)
    await seedPurchaseOrders(stores, vendorResult.supplierIds, productIds)
    await seedInvoices(customerIds, vendorResult.vendorIds)

  } catch (e) {
    console.error('FATAL: ' + e.message)
    flag('Fatal: ' + e.message)
  }

  console.log('\n=== SEED SUMMARY ===')
  var keys = Object.keys(SUMMARY)
  for (var i = 0; i < keys.length; i++) {
    console.log('  ' + keys[i] + ': ' + SUMMARY[keys[i]])
  }

  if (FLAGS.length > 0) {
    console.log('\n=== FLAGS (' + FLAGS.length + ') ===')
    for (var j = 0; j < FLAGS.length; j++) { console.log(' - ' + FLAGS[j]) }
  } else {
    console.log('\n  No flags.')
  }

  console.log('\nFinished: ' + new Date().toISOString())
  await prisma.$disconnect()
}

main().catch(async function(e) {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
