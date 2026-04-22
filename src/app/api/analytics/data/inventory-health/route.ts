import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { category: 'Footwear', onHand: 1840, onOrder: 420, daysOfSupply: 38, turnoverRate: 9.6, stockoutRisk: 'Low' },
    { category: 'Apparel', onHand: 3120, onOrder: 680, daysOfSupply: 45, turnoverRate: 8.1, stockoutRisk: 'Low' },
    { category: 'Electronics', onHand: 284, onOrder: 180, daysOfSupply: 19, turnoverRate: 19.2, stockoutRisk: 'High' },
    { category: 'Accessories', onHand: 2840, onOrder: 0, daysOfSupply: 54, turnoverRate: 6.8, stockoutRisk: 'Low' },
    { category: 'Outerwear', onHand: 612, onOrder: 340, daysOfSupply: 29, turnoverRate: 12.6, stockoutRisk: 'Medium' },
    { category: 'Sporting Goods', onHand: 980, onOrder: 120, daysOfSupply: 41, turnoverRate: 8.9, stockoutRisk: 'Low' },
    { category: 'Home & Living', onHand: 1240, onOrder: 0, daysOfSupply: 72, turnoverRate: 5.1, stockoutRisk: 'Low' },
    { category: 'Beauty', onHand: 186, onOrder: 240, daysOfSupply: 8, turnoverRate: 45.6, stockoutRisk: 'Critical' },
  ])
}
