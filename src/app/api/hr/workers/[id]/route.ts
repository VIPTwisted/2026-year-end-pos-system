export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({
    data: null,
    id: params.id,
  })
}
