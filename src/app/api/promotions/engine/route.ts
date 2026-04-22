import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const PROMOS = [
  { id:1,  name:'Summer Coffee Deal',    type:'BOGO',           discount:'Buy 1 Get 1 50%',    minPurchase:0,  channels:'POS + Online', start:'2026-04-01', end:'2026-06-30',   uses:2841,  stackable:false, priority:10, status:'Active' },
  { id:2,  name:'Gold Member Bonus',     type:'PERCENT_OFF',    discount:'5%',                 minPurchase:0,  channels:'All',          start:'2026-04-01', end:'2026-12-31',   uses:1204,  stackable:true,  priority:5,  status:'Active' },
  { id:3,  name:'Bulk Headphones',       type:'QTY_THRESHOLD',  discount:'10% off 3+',         minPurchase:0,  channels:'POS',          start:'2026-04-15', end:'2026-05-15',   uses:89,    stackable:false, priority:20, status:'Active' },
  { id:4,  name:'Welcome Discount',      type:'PERCENT_OFF',    discount:'15% first purchase', minPurchase:0,  channels:'Online',       start:null,         end:null,           uses:412,   stackable:false, priority:15, status:'Active' },
  { id:5,  name:'Electronics Clearance', type:'PERCENT_OFF',    discount:'20%',                minPurchase:50, channels:'POS',          start:'2026-04-20', end:'2026-04-30',   uses:234,   stackable:false, priority:25, status:'Active' },
  { id:6,  name:'Spring BOGO Tees',      type:'BOGO',           discount:'Buy 1 Get 1 Free',   minPurchase:0,  channels:'Online',       start:'2026-03-01', end:'2026-05-31',   uses:567,   stackable:false, priority:12, status:'Active' },
  { id:7,  name:'Loyal 10 Discount',     type:'PERCENT_OFF',    discount:'10%',                minPurchase:25, channels:'All',          start:'2026-01-01', end:'2026-12-31',   uses:3102,  stackable:true,  priority:8,  status:'Active' },
  { id:8,  name:'Buy 3 Save $15',        type:'FIXED_OFF',      discount:'$15 off 3+ items',   minPurchase:60, channels:'POS',          start:'2026-04-01', end:'2026-04-30',   uses:45,    stackable:false, priority:30, status:'Active' },
  { id:9,  name:'Referral Reward',       type:'PERCENT_OFF',    discount:'10% one-time',       minPurchase:0,  channels:'Online',       start:null,         end:null,           uses:198,   stackable:false, priority:18, status:'Active' },
  { id:10, name:'Clearance Footwear',    type:'PERCENT_OFF',    discount:'30%',                minPurchase:0,  channels:'POS + Online', start:'2026-04-10', end:'2026-04-25',   uses:312,   stackable:false, priority:22, status:'Active' },
]

const COUPONS = [
  { id:1,  code:'SAVE15',    promoId:4,  type:'Universal',        usesCount:412,  maxUses:null, expiry:'2026-12-31', status:'Active' },
  { id:2,  code:'SUMMER20',  promoId:6,  type:'Universal',        usesCount:89,   maxUses:500,  expiry:'2026-06-30', status:'Active' },
  { id:3,  code:'VIP2026',   promoId:2,  type:'Single-use batch', usesCount:34,   maxUses:100,  expiry:'2026-04-30', status:'Active' },
  { id:4,  code:'EXPIRED10', promoId:9,  type:'Universal',        usesCount:847,  maxUses:1000, expiry:'2026-03-31', status:'Expired' },
  { id:5,  code:'BULK10',    promoId:3,  type:'Universal',        usesCount:89,   maxUses:null, expiry:'2026-05-15', status:'Active' },
  { id:6,  code:'SPRING25',  promoId:6,  type:'Universal',        usesCount:120,  maxUses:null, expiry:'2026-05-31', status:'Active' },
  { id:7,  code:'LOYAL10',   promoId:7,  type:'Universal',        usesCount:3102, maxUses:null, expiry:'2026-12-31', status:'Active' },
  { id:8,  code:'REFER10',   promoId:9,  type:'Single-use batch', usesCount:198,  maxUses:null, expiry:'2026-12-31', status:'Active' },
  { id:9,  code:'CLEAR30',   promoId:10, type:'Universal',        usesCount:312,  maxUses:null, expiry:'2026-04-25', status:'Active' },
  { id:10, code:'OLDSPRING', promoId:6,  type:'Universal',        usesCount:240,  maxUses:300,  expiry:'2026-03-01', status:'Expired' },
]

const PERFORMANCE = {
  totalPromotions: 23,
  discountsYTD: 84231,
  avgDiscountPerTxn: 12.40,
  topPromo: 'Summer Coffee Deal',
  topPromosByDiscount: [
    { name:'Summer Coffee Deal',    total:28400 },
    { name:'Loyal 10 Discount',     total:18200 },
    { name:'Electronics Clearance', total:12600 },
    { name:'Welcome Discount',      total:9800 },
    { name:'Clearance Footwear',    total:7200 },
  ],
}

export async function GET() {
  return NextResponse.json({ promotions: PROMOS, coupons: COUPONS, performance: PERFORMANCE })
}

export async function POST(req: Request) {
  const body = await req.json()
  return NextResponse.json({ success: true, promotion: { id: Date.now(), status: 'Active', uses: 0, ...body } }, { status: 201 })
}
