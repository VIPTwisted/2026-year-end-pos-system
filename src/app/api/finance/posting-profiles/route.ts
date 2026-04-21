import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const profiles = await prisma.postingProfile.findMany({
      include: {
        rules: {
          include: {
            debitAccount: true,
            creditAccount: true,
          },
        },
      },
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    })
    return NextResponse.json({ profiles })
  } catch (err) {
    console.error('[GET /api/finance/posting-profiles]', err)
    return NextResponse.json({ error: 'Failed to load posting profiles' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, name, module, description, isDefault, rules = [] } = body

    if (!code || !name || !module) {
      return NextResponse.json({ error: 'code, name, and module are required' }, { status: 400 })
    }

    const validModules = ['AP', 'AR', 'INVENTORY', 'BANK', 'PAYROLL']
    if (!validModules.includes(module)) {
      return NextResponse.json({ error: `module must be one of: ${validModules.join(', ')}` }, { status: 400 })
    }

    // If isDefault, clear existing defaults for that module
    if (isDefault) {
      await prisma.postingProfile.updateMany({
        where: { module, isDefault: true },
        data: { isDefault: false },
      })
    }

    const profile = await prisma.postingProfile.create({
      data: {
        code: code.toUpperCase(),
        name,
        module,
        description: description ?? null,
        isDefault: isDefault ?? false,
        rules: {
          create: rules.map((r: {
            transactionType: string
            debitAccountId?: string | null
            creditAccountId?: string | null
            applicableTo?: string | null
          }) => ({
            transactionType: r.transactionType,
            debitAccountId: r.debitAccountId ?? null,
            creditAccountId: r.creditAccountId ?? null,
            applicableTo: r.applicableTo ?? null,
          })),
        },
      },
      include: {
        rules: {
          include: {
            debitAccount: true,
            creditAccount: true,
          },
        },
      },
    })

    return NextResponse.json({ profile }, { status: 201 })
  } catch (err: unknown) {
    console.error('[POST /api/finance/posting-profiles]', err)
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'A profile with that code already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create posting profile' }, { status: 500 })
  }
}
