import { NextResponse } from 'next/server'

// LoyaltyBonus model was consolidated into LoyaltyTransaction (type: 'adjust' | 'earn' with multiplier)
// This endpoint returns an empty array for backward compatibility
export async function GET() {
  return NextResponse.json([])
}

export async function POST() {
  return NextResponse.json({ error: 'Bonus system consolidated into transactions. Use /api/loyalty/earn instead.' }, { status: 410 })
}
