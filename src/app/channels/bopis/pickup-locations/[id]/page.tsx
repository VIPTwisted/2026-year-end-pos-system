export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronLeft, MapPin, Clock } from 'lucide-react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default async function PickupLocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const location = await prisma.pickupLocation.findUnique({
    where: { id },
    include: { timeSlots: { orderBy: { dayOfWeek: 'asc' } }, deliveryMode: true },
  })
  if (!location) return <main className="flex-1 p-6 bg-zinc-950"><p className="text-zinc-500 text-sm">Location not found</p></main>

  const slotsByDay = DAYS.map((day, i) => ({
    day,
    slots: location.timeSlots.filter(s => s.dayOfWeek === i),
  }))

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/channels/bopis" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-xs"><ChevronLeft className="w-3 h-3" /> BOPIS</Link>
        <span className="text-zinc-700">/</span>
        <h1 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-zinc-500" /> {location.storeName ?? 'Pickup Location'}
        </h1>
      </div>

      {/* Location info */}
      <section>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Location Information</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          {[
            { label: 'Store Name', value: location.storeName ?? '—' },
            { label: 'Address', value: location.address ?? '—' },
            { label: 'City', value: location.city ?? '—' },
            { label: 'State', value: location.state ?? '—' },
            { label: 'ZIP Code', value: location.zipCode ?? '—' },
            { label: 'Phone', value: location.phone ?? '—' },
            { label: 'Delivery Mode', value: location.deliveryMode.name },
            { label: 'Status', value: location.isActive ? 'Active' : 'Inactive' },
          ].map(item => (
            <div key={item.label}>
              <div className="text-xs text-zinc-500 mb-1">{item.label}</div>
              <div className="text-xs text-zinc-200">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Time slots table */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Time Slots ({location.timeSlots.length})</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Day</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Open</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Close</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Slot (min)</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Max Orders</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {location.timeSlots.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-600">No time slots configured</td></tr>
              ) : location.timeSlots.map(slot => (
                <tr key={slot.id} className="hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 text-zinc-300">{DAYS[slot.dayOfWeek]}</td>
                  <td className="px-4 py-2.5 text-zinc-400 font-mono">{slot.openTime}</td>
                  <td className="px-4 py-2.5 text-zinc-400 font-mono">{slot.closeTime}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{slot.slotDurationMin}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{slot.maxOrders}</td>
                  <td className="px-4 py-2.5"><span className={slot.isActive ? 'text-emerald-400' : 'text-zinc-600'}>{slot.isActive ? 'Yes' : 'No'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Weekly visual grid */}
      <section>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Weekly Grid</p>
        <div className="grid grid-cols-7 gap-2">
          {slotsByDay.map(({ day, slots }) => (
            <div key={day} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2">
              <div className="text-xs font-medium text-zinc-400 mb-2 text-center">{day.slice(0, 3)}</div>
              {slots.length === 0 ? (
                <div className="h-8 flex items-center justify-center text-zinc-700 text-xs">—</div>
              ) : slots.map(s => (
                <div key={s.id} className={`mb-1 px-1.5 py-1 rounded text-xs text-center font-mono ${s.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-600'}`}>
                  {s.openTime}–{s.closeTime}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
