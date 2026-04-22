import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { StoreEditForm } from '../StoreEditForm'

export default async function StoreEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const store = await prisma.store.findUnique({ where: { id } })
  if (!store) notFound()

  return (
    <>
      <TopBar
        title="Edit Store"
        breadcrumb={[
          { label: 'Stores', href: '/stores' },
          { label: store.name, href: `/stores/${id}` },
        ]}
        showBack
      />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-2xl mx-auto p-6">
          <StoreEditForm
            store={{
              id: store.id,
              name: store.name,
              address: store.address,
              city: store.city,
              state: store.state,
              zip: store.zip,
              phone: store.phone,
              email: store.email,
              taxRate: store.taxRate,
              currency: store.currency,
              isActive: store.isActive,
            }}
          />
        </div>
      </main>
    </>
  )
}
