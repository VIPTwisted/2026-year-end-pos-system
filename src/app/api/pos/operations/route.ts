import { NextResponse } from 'next/server'
import { POS_OPERATIONS, getOperationsByGroup, OPERATION_GROUPS, OperationGroup } from '@/lib/pos/operations'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const group = searchParams.get('group') as OperationGroup | null
  const id = searchParams.get('id')
  const screen = searchParams.get('screen') // 'transaction' | 'welcome'
  const offline = searchParams.get('offline') // 'true'

  let ops = Object.values(POS_OPERATIONS)

  // Filter by group
  if (group) {
    if (!OPERATION_GROUPS.includes(group)) {
      return NextResponse.json({ error: `Invalid group. Valid groups: ${OPERATION_GROUPS.join(', ')}` }, { status: 400 })
    }
    ops = getOperationsByGroup(group)
  }

  // Filter by single ID
  if (id) {
    const numId = parseInt(id, 10)
    const op = POS_OPERATIONS[numId]
    if (!op) {
      return NextResponse.json({ error: `Operation ${id} not found` }, { status: 404 })
    }
    return NextResponse.json({ operation: op })
  }

  // Filter by screen availability
  if (screen === 'transaction') {
    ops = ops.filter(op => op.availableOnTransactionScreen)
  } else if (screen === 'welcome') {
    ops = ops.filter(op => op.availableOnWelcomeScreen)
  }

  // Filter by offline availability
  if (offline === 'true') {
    ops = ops.filter(op => op.availableOffline)
  }

  // Group the results for convenient consumption
  const grouped = OPERATION_GROUPS.reduce<Record<string, typeof ops>>((acc, g) => {
    const groupOps = ops.filter(op => op.group === g)
    if (groupOps.length) acc[g] = groupOps
    return acc
  }, {})

  return NextResponse.json({
    total: ops.length,
    groups: OPERATION_GROUPS,
    operations: ops,
    grouped,
  })
}
