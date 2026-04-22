'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Wrench, UserCheck, Activity, History, Download, ChevronRight, Truck } from 'lucide-react'

type Vehicle = {
  id: string
  vehicleId: string
  makeModel: string
  year: number
  licensePlate: string
  assignedDriver: string
  mileage: number
  lastService: string
  nextService: string
  status: 'Available' | 'In Use' | 'Maintenance' | 'Out of Service'
  location: string
}

type MaintenanceRow = {
  vehicleId: string
  vehicle: string
  serviceType: string
  dueDate: string
  estimatedCost: number
  assignedMechanic: string
}

const STATUS_STYLES: Record<string, string> = {
  Available: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'In Use': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Maintenance: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Out of Service': 'bg-red-500/15 text-red-400 border-red-500/30',
}

const STATUS_DOT: Record<string, string> = {
  Available: 'bg-emerald-400', 'In Use': 'bg-blue-400', Maintenance: 'bg-amber-400', 'Out of Service': 'bg-red-400',
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isOverdue(dateStr: string) {
  return new Date(dateStr) < new Date()
}

export default function FleetManagementPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [maintenance, setMaintenance] = useState<MaintenanceRow[]>([])
  const [avgMileage, setAvgMileage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/operations/fleet')
      .then(r => r.ok ? r.json() : { vehicles: [], maintenance: [], avgMileage: 0 })
      .then(d => {
        setVehicles(d.vehicles ?? [])
        setMaintenance(d.maintenance ?? [])
        setAvgMileage(d.avgMileage ?? 0)
      })
      .finally(() => setLoading(false))
  }, [])

  const inUse = vehicles.filter(v => v.status === 'In Use').length
  const maintenanceDue = vehicles.filter(v => v.status === 'Maintenance' || isOverdue(v.nextService)).length

  return (
    <>
      <TopBar title="Fleet Management" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Operations</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">Fleet Management</span>
        </nav>

        {/* Action Ribbon */}
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add vehicle
          </button>
          {[
            { icon: Wrench, label: 'Schedule service' },
            { icon: UserCheck, label: 'Assign driver' },
            { icon: Activity, label: 'Log mileage' },
            { icon: History, label: 'View history' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors">
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors ml-auto">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>

        {/* KPI Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Fleet', value: vehicles.length, sub: 'All vehicles' },
            { label: 'In Use', value: inUse, sub: 'Currently deployed', valueClass: 'text-blue-300' },
            { label: 'Maintenance Due', value: maintenanceDue, sub: 'Needs attention', valueClass: maintenanceDue > 0 ? 'text-amber-400' : 'text-emerald-400' },
            { label: 'Avg Mileage', value: avgMileage.toLocaleString(), sub: 'Across fleet', valueClass: 'text-zinc-300' },
          ].map(k => (
            <div key={k.label} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
              <p className="text-[11px] text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.valueClass ?? 'text-zinc-100'}`}>{k.value}</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Vehicle Table */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
            <Truck className="w-4 h-4 text-zinc-500" />
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Vehicle List</h3>
          </div>
          {loading ? (
            <div className="text-center py-12 text-xs text-zinc-600">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Vehicle ID', 'Make / Model', 'Year', 'License Plate', 'Assigned Driver', 'Mileage', 'Last Service', 'Next Service', 'Status', 'Location'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v, idx) => {
                    const overdue = isOverdue(v.nextService) && v.status !== 'Out of Service'
                    return (
                      <tr key={v.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-zinc-800/10'}`}>
                        <td className="px-4 py-3 font-mono text-zinc-500">{v.vehicleId}</td>
                        <td className="px-4 py-3 text-zinc-100 font-medium">{v.makeModel}</td>
                        <td className="px-4 py-3 text-zinc-400">{v.year}</td>
                        <td className="px-4 py-3 font-mono text-zinc-300">{v.licensePlate}</td>
                        <td className="px-4 py-3 text-zinc-400">{v.assignedDriver}</td>
                        <td className="px-4 py-3 text-zinc-300 font-mono">{v.mileage.toLocaleString()}</td>
                        <td className="px-4 py-3 text-zinc-500">{formatDate(v.lastService)}</td>
                        <td className={`px-4 py-3 font-medium ${overdue ? 'text-red-400' : 'text-zinc-400'}`}>
                          {formatDate(v.nextService)}
                          {overdue && <span className="ml-1.5 text-[10px] bg-red-500/15 text-red-400 border border-red-500/30 px-1 py-0.5 rounded">Overdue</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-full text-[11px] border ${STATUS_STYLES[v.status]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[v.status]}`} />
                            {v.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-500">{v.location}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Maintenance Schedule Table */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-zinc-500" />
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Maintenance Schedule</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Vehicle', 'Service Type', 'Due Date', 'Est. Cost', 'Assigned Mechanic'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {maintenance.map((m, idx) => {
                  const overdue = isOverdue(m.dueDate)
                  return (
                    <tr key={`${m.vehicleId}-${idx}`} className={`border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-zinc-800/10'}`}>
                      <td className="px-4 py-3 text-zinc-200 font-medium">{m.vehicle}</td>
                      <td className="px-4 py-3 text-zinc-400">{m.serviceType}</td>
                      <td className={`px-4 py-3 font-medium ${overdue ? 'text-red-400' : 'text-zinc-400'}`}>
                        {formatDate(m.dueDate)}
                        {overdue && <span className="ml-1.5 text-[10px] bg-red-500/15 text-red-400 border border-red-500/30 px-1 py-0.5 rounded">Overdue</span>}
                      </td>
                      <td className="px-4 py-3 text-zinc-300 font-mono">${m.estimatedCost.toLocaleString()}</td>
                      <td className="px-4 py-3 text-zinc-400">{m.assignedMechanic}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
