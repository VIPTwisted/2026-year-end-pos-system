'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

type Member = { userName: string; role: string }

export default function NewQueuePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('standard')
  const [members, setMembers] = useState<Member[]>([])
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('agent')

  function addMember() {
    if (!newMemberName.trim()) return
    setMembers(prev => [...prev, { userName: newMemberName.trim(), role: newMemberRole }])
    setNewMemberName('')
    setNewMemberRole('agent')
  }

  function removeMember(i: number) {
    setMembers(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit() {
    if (!name.trim()) return
    setSaving(true)
    const res = await fetch('/api/service/queues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, type, members }),
    })
    if (res.ok) {
      router.push('/service/queues')
    } else {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Service Queue" />
      <main className="flex-1 p-6 max-w-2xl space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/service/queues"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
        </Button>

        <Card>
          <CardContent className="pt-6 pb-6 space-y-5">
            <h2 className="text-lg font-semibold text-zinc-100">Queue Details</h2>

            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tier 1 Support" />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 resize-none"
                placeholder="Optional description…"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Type</Label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="escalation">Escalation</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 pb-6 space-y-4">
            <h2 className="text-base font-semibold text-zinc-100">Members</h2>

            <div className="flex gap-2">
              <Input
                placeholder="Agent name or email…"
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addMember()}
                className="flex-1"
              />
              <select value={newMemberRole} onChange={e => setNewMemberRole(e.target.value)} className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
                <option value="agent">Agent</option>
                <option value="manager">Manager</option>
              </select>
              <Button variant="outline" size="sm" onClick={addMember}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {members.length === 0 ? (
              <p className="text-sm text-zinc-600">No members added.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-2 font-medium">Name</th>
                    <th className="text-left pb-2 font-medium">Role</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {members.map((m, i) => (
                    <tr key={i}>
                      <td className="py-2.5 pr-4 text-zinc-300">{m.userName}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${m.role === 'manager' ? 'bg-amber-900/40 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>
                          {m.role}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 h-7 w-7 p-0" onClick={() => removeMember(i)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSubmit} disabled={saving || !name.trim()}>
            {saving ? 'Creating…' : 'Create Queue'}
          </Button>
          <Button asChild variant="ghost">
            <Link href="/service/queues">Cancel</Link>
          </Button>
        </div>
      </main>
    </>
  )
}
