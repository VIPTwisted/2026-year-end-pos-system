import { NextRequest, NextResponse } from 'next/server'

// In-memory store for demo; swap for DB/KV in production
const favoritesStore: Record<string, string[]> = {}
const DEFAULT_USER = 'default'

const DEFAULT_FAVORITES = [
  'Budget control configuration',
  'Budget cycles',
  'Open positions',
]

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId') ?? DEFAULT_USER
  const favorites = favoritesStore[userId] ?? DEFAULT_FAVORITES
  return NextResponse.json({ userId, favorites }, { status: 200 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { userId?: string; item?: string; action?: 'add' | 'remove' }
    const userId = body.userId ?? DEFAULT_USER
    const { item, action = 'add' } = body

    if (!item || typeof item !== 'string') {
      return NextResponse.json({ error: 'item is required' }, { status: 400 })
    }

    if (!favoritesStore[userId]) {
      favoritesStore[userId] = [...DEFAULT_FAVORITES]
    }

    if (action === 'add') {
      if (!favoritesStore[userId].includes(item)) {
        favoritesStore[userId] = [...favoritesStore[userId], item]
      }
    } else if (action === 'remove') {
      favoritesStore[userId] = favoritesStore[userId].filter(f => f !== item)
    } else {
      return NextResponse.json({ error: 'action must be "add" or "remove"' }, { status: 400 })
    }

    return NextResponse.json({ userId, favorites: favoritesStore[userId] }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
}
