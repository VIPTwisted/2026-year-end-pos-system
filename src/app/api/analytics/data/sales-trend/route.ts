import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') ?? '30', 10)
  const data = Array.from({ length: days }, (_, i) => {
    const seed = (i * 7 + 13) % 100
    const dayOfWeek = new Date(Date.now() - (days - 1 - i) * 86400000).getDay()
    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.4 : 1.0
    const base = 12000 + seed * 130
    const revenue = parseFloat((base * weekendBoost + (Math.random() * 2000 - 1000)).toFixed(2))
    const transactions = Math.round(140 + seed * 1.1 + (weekendBoost - 1) * 60)
    return {
      date: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().slice(0, 10),
      revenue, transactions, avgTicket: parseFloat((revenue / transactions).toFixed(2)),
    }
  })
  return NextResponse.json(data)
}
