'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Rocket, CheckCircle2, UserPlus } from 'lucide-react'

interface CampaignActionsProps {
  campaignId: string
  currentStatus: string
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
}

export function CampaignActions({ campaignId, currentStatus }: CampaignActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Add contacts state
  const [showAddContact, setShowAddContact] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [contactLoading, setContactLoading] = useState(false)
  const [contactError, setContactError] = useState('')
  const [customersLoaded, setCustomersLoaded] = useState(false)

  async function handleStatusChange(newStatus: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/marketing/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to update campaign.')
      } else {
        router.refresh()
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  async function openAddContact() {
    setShowAddContact(true)
    if (!customersLoaded) {
      setContactLoading(true)
      try {
        const res = await fetch('/api/customers')
        const data: Customer[] = await res.json()
        setCustomers(data)
        setCustomersLoaded(true)
        if (data.length > 0) setSelectedCustomerId(data[0].id)
      } catch {
        setContactError('Failed to load customers.')
      } finally {
        setContactLoading(false)
      }
    }
  }

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCustomerId) {
      setContactError('Select a customer.')
      return
    }
    setContactLoading(true)
    setContactError('')
    try {
      const res = await fetch(`/api/marketing/campaigns/${campaignId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: selectedCustomerId }),
      })
      if (!res.ok) {
        const data = await res.json()
        setContactError(data.error ?? 'Failed to add contact.')
      } else {
        setShowAddContact(false)
        setSelectedCustomerId(customers[0]?.id ?? '')
        router.refresh()
      }
    } catch {
      setContactError('Network error.')
    } finally {
      setContactLoading(false)
    }
  }

  const isDraft = currentStatus === 'draft'
  const isActive = currentStatus === 'active'

  return (
    <Card>
      <CardContent className="pt-5 pb-5 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Actions</h3>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {isDraft && (
            <Button
              onClick={() => handleStatusChange('active')}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Rocket className="w-4 h-4 mr-1" />
              {loading ? 'Launching…' : 'Launch Campaign'}
            </Button>
          )}

          {isActive && (
            <Button
              onClick={() => handleStatusChange('completed')}
              disabled={loading}
              variant="outline"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              {loading ? 'Completing…' : 'Mark Complete'}
            </Button>
          )}

          <Button variant="outline" onClick={openAddContact} disabled={loading}>
            <UserPlus className="w-4 h-4 mr-1" />
            Add Contact
          </Button>
        </div>

        {showAddContact && (
          <form
            onSubmit={handleAddContact}
            className="border border-zinc-800 rounded-lg p-4 space-y-4 bg-zinc-900/50"
          >
            <h4 className="text-sm font-semibold text-zinc-200">Add Contact to Campaign</h4>

            {contactError && (
              <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-400">
                {contactError}
              </div>
            )}

            {contactLoading && !customersLoaded ? (
              <p className="text-sm text-zinc-500">Loading customers…</p>
            ) : (
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                  Customer *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select customer…</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} — {c.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={contactLoading || !customersLoaded}>
                <UserPlus className="w-4 h-4 mr-1" />
                {contactLoading ? 'Adding…' : 'Add Contact'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowAddContact(false); setContactError('') }}
                disabled={contactLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
