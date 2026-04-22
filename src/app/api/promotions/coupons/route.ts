export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    data: null,
    total: 0,
    page: 1,
    pageSize: 25,
  })
}
