import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  Cpu, Settings2, Receipt, Monitor, CreditCard,
  Store, Percent, Star, ChevronRight,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ConfigCard {
  title: string
  description: string
  href: string
  icon: React.ElementType
  count: number | null
}

export default async function ConfigurationPage() {
  const [hwCount, fpCount, rpCount, regCount, pmCount] = await Promise.all([
    prisma.hardwareProfile.count(),
    prisma.functionalityProfile.count(),
    prisma.receiptProfile.count(),
    prisma.posRegister.count(),
    prisma.storePaymentMethod.count(),
  ])

  const cards: ConfigCard[] = [
    {
      title: 'Hardware Profiles',
      description: 'Configure printers, cash drawers, payment terminals, and barcode scanners for each register.',
      href: '/configuration/hardware-profiles',
      icon: Cpu,
      count: hwCount,
    },
    {
      title: 'Functionality Profiles',
      description: 'Control POS behavior: discounts, voids, offline mode, loyalty, and transaction rules.',
      href: '/configuration/functionality-profiles',
      icon: Settings2,
      count: fpCount,
    },
    {
      title: 'Receipt Profiles',
      description: 'Customize receipt headers, footers, display options, and paper format.',
      href: '/configuration/receipt-profiles',
      icon: Receipt,
      count: rpCount,
    },
    {
      title: 'POS Registers',
      description: 'Assign hardware and functionality profiles to physical registers by store.',
      href: '/configuration/registers',
      icon: Monitor,
      count: regCount,
    },
    {
      title: 'Payment Methods',
      description: 'Enable and configure accepted tender types per store with limits and processor settings.',
      href: '/configuration/payment-methods',
      icon: CreditCard,
      count: pmCount,
    },
    {
      title: 'Store Settings',
      description: 'Manage store details, tax rates, currency, and contact information.',
      href: '/stores',
      icon: Store,
      count: null,
    },
    {
      title: 'Tax Rates',
      description: 'Define tax codes and rates applied to taxable products at the register.',
      href: '/finance/tax',
      icon: Percent,
      count: null,
    },
    {
      title: 'Loyalty Programs',
      description: 'Configure points earning, tiers, redemption rules, and member benefits.',
      href: '/loyalty',
      icon: Star,
      count: null,
    },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Configuration" />
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <p className="text-zinc-500 text-sm mt-1">
            D365 Commerce — POS and channel configuration settings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 hover:border-blue-500/50 hover:bg-[#1a2550] transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-md bg-blue-600/15 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-blue-400" />
                  </div>
                  {card.count !== null && (
                    <span className="text-[11px] font-semibold bg-zinc-800 text-zinc-400 rounded-full px-2 py-0.5">
                      {card.count}
                    </span>
                  )}
                </div>
                <h3 className="text-[13px] font-semibold text-zinc-100 mb-1">{card.title}</h3>
                <p className="text-[12px] text-zinc-500 leading-relaxed mb-3">{card.description}</p>
                <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-blue-500 group-hover:text-blue-400 transition-colors">
                  Configure
                  <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
