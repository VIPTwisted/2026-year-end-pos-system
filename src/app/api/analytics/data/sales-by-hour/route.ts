import { NextResponse } from 'next/server'

export async function GET() {
  const profile = [
    { hour: 9, base: 45 }, { hour: 10, base: 82 }, { hour: 11, base: 124 },
    { hour: 12, base: 168 }, { hour: 13, base: 155 }, { hour: 14, base: 141 },
    { hour: 15, base: 158 }, { hour: 16, base: 172 }, { hour: 17, base: 194 },
    { hour: 18, base: 186 }, { hour: 19, base: 148 }, { hour: 20, base: 97 },
    { hour: 21, base: 52 },
  ]
  const data = profile.map(({ hour, base }) => {
    const transactions = base + Math.round(Math.random() * 20 - 10)
    const revenue = parseFloat((transactions * (68 + Math.random() * 40)).toFixed(2))
    return {
      hour,
      label: hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`,
      transactions, revenue,
    }
  })
  return NextResponse.json(data)
}
