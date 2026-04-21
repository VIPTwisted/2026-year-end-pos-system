import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Use: npm run db:seed' })
}
