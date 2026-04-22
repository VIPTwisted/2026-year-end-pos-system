import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ITEMS = [
  { itemNo: '1000',    description: 'Widget Assembly A100',      itemGroup: 'Finished Goods', category: 'Finished',     uom: 'EA', standardCost: 22.00,  salesPrice: 34.99,  onHand: 450,   leadTime: '14 days' },
  { itemNo: '1001',    description: 'Motor Housing B200',         itemGroup: 'Components',     category: 'Raw Material', uom: 'EA', standardCost: 89.00,  salesPrice: null,   onHand: 28,    leadTime: '21 days' },
  { itemNo: '1002',    description: 'Control Panel C300',         itemGroup: 'Components',     category: 'BOM',          uom: 'EA', standardCost: 145.00, salesPrice: 229.99, onHand: 0,     leadTime: '7 days' },
  { itemNo: '1003',    description: 'Drive Unit D400',            itemGroup: 'Components',     category: 'Raw Material', uom: 'EA', standardCost: 210.00, salesPrice: null,   onHand: 75,    leadTime: '28 days' },
  { itemNo: '1004',    description: 'Standard Bolt M8 x25',       itemGroup: 'Hardware',       category: 'Raw Material', uom: 'EA', standardCost: 0.12,   salesPrice: null,   onHand: 12400, leadTime: '3 days' },
  { itemNo: '1005',    description: 'Packaging Box Small',         itemGroup: 'Packaging',      category: 'Consumable',   uom: 'EA', standardCost: 0.45,   salesPrice: null,   onHand: 2800,  leadTime: '5 days' },
  { itemNo: '1006',    description: 'Premium Coffee Blend',        itemGroup: 'Retail',         category: 'Finished',     uom: 'LB', standardCost: 8.50,   salesPrice: 15.99,  onHand: 340,   leadTime: '2 days' },
  { itemNo: 'SRV-001', description: 'Installation Service',       itemGroup: 'Services',       category: 'Service',      uom: 'HR', standardCost: 85.00,  salesPrice: 125.00, onHand: null,  leadTime: null },
  { itemNo: '1007',    description: 'Sensor Module E500',          itemGroup: 'Electronics',    category: 'Raw Material', uom: 'EA', standardCost: 34.50,  salesPrice: null,   onHand: 156,   leadTime: '10 days' },
  { itemNo: '1008',    description: 'Aluminum Frame F600',         itemGroup: 'Components',     category: 'Raw Material', uom: 'EA', standardCost: 67.00,  salesPrice: null,   onHand: 44,    leadTime: '14 days' },
  { itemNo: '1009',    description: 'T-Shirt Classic White S',     itemGroup: 'Apparel',        category: 'Finished',     uom: 'EA', standardCost: 4.20,   salesPrice: 19.99,  onHand: 380,   leadTime: '7 days' },
  { itemNo: '1010',    description: 'T-Shirt Classic Black M',     itemGroup: 'Apparel',        category: 'Finished',     uom: 'EA', standardCost: 4.20,   salesPrice: 19.99,  onHand: 410,   leadTime: '7 days' },
  { itemNo: '1011',    description: 'Lubricant Oil 1L',            itemGroup: 'MRO',            category: 'Consumable',   uom: 'LT', standardCost: 6.75,   salesPrice: null,   onHand: 88,    leadTime: '4 days' },
  { itemNo: '1012',    description: 'Safety Gloves (Pair)',        itemGroup: 'Safety',         category: 'Consumable',   uom: 'PR', standardCost: 2.30,   salesPrice: null,   onHand: 240,   leadTime: '5 days' },
  { itemNo: '1013',    description: 'Bearing Assembly G700',       itemGroup: 'Components',     category: 'Raw Material', uom: 'EA', standardCost: 18.90,  salesPrice: null,   onHand: 92,    leadTime: '12 days' },
  { itemNo: '1014',    description: 'Cable Harness H800',          itemGroup: 'Electronics',    category: 'BOM',          uom: 'EA', standardCost: 41.00,  salesPrice: 68.50,  onHand: 33,    leadTime: '9 days' },
  { itemNo: '1015',    description: 'Foam Insert (Custom)',        itemGroup: 'Packaging',      category: 'Consumable',   uom: 'EA', standardCost: 1.10,   salesPrice: null,   onHand: 1200,  leadTime: '6 days' },
  { itemNo: '1016',    description: 'Gasket Seal Ring (10-pack)',  itemGroup: 'Hardware',       category: 'Raw Material', uom: 'PK', standardCost: 3.40,   salesPrice: null,   onHand: 760,   leadTime: '3 days' },
  { itemNo: '1017',    description: 'LED Panel 24V',               itemGroup: 'Electronics',    category: 'Raw Material', uom: 'EA', standardCost: 29.00,  salesPrice: null,   onHand: 105,   leadTime: '8 days' },
  { itemNo: '1018',    description: 'Display Module I900',         itemGroup: 'Electronics',    category: 'BOM',          uom: 'EA', standardCost: 112.00, salesPrice: 189.00, onHand: 17,    leadTime: '15 days' },
  { itemNo: '1019',    description: 'Spring Clip (100-pack)',      itemGroup: 'Hardware',       category: 'Raw Material', uom: 'PK', standardCost: 4.80,   salesPrice: null,   onHand: 330,   leadTime: '3 days' },
  { itemNo: '1020',    description: 'Power Supply 12V 5A',         itemGroup: 'Electronics',    category: 'Raw Material', uom: 'EA', standardCost: 22.50,  salesPrice: null,   onHand: 64,    leadTime: '7 days' },
  { itemNo: 'SRV-002', description: 'Maintenance Contract',       itemGroup: 'Services',       category: 'Service',      uom: 'MO', standardCost: 300.00, salesPrice: 450.00, onHand: null,  leadTime: null },
  { itemNo: '1021',    description: 'Coffee Grind Coarse 5LB',    itemGroup: 'Retail',         category: 'Finished',     uom: 'BG', standardCost: 36.00,  salesPrice: 59.99,  onHand: 120,   leadTime: '2 days' },
  { itemNo: '1022',    description: 'Thermal Transfer Label Roll', itemGroup: 'Packaging',      category: 'Consumable',   uom: 'RL', standardCost: 12.00,  salesPrice: null,   onHand: 85,    leadTime: '4 days' },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search   = (searchParams.get('search') ?? '').toLowerCase()
  const category = searchParams.get('category') ?? 'All'
  const page     = parseInt(searchParams.get('page') ?? '1', 10)
  const limit    = parseInt(searchParams.get('limit') ?? '25', 10)

  let filtered = ITEMS.filter(item => {
    const matchCat = category === 'All' || item.category === category
    const matchSearch = !search || item.itemNo.toLowerCase().includes(search) || item.description.toLowerCase().includes(search)
    return matchCat && matchSearch
  })

  const total = filtered.length
  const offset = (page - 1) * limit
  const items = filtered.slice(offset, offset + limit)

  return NextResponse.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) })
}
