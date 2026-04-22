'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X, ChevronDown, ChevronRight, Beaker, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type QualityTest = {
  id: string
  name: string
  testType: string
  minValue: number | null
  maxValue: number | null
  unit: string | null
}

type QualityTestGroup = {
  id: string
  name: string
  description: string | null
  tests: QualityTest[]
  createdAt: string
}

export default function TestGroupsPage() {
  const [groups, setGroups] = useState<QualityTestGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [groupForm, setGroupForm] = useState({ name: '', description: '' })
  const [pendingTests, setPendingTests] = useState<Omit<QualityTest, 'id'>[]>([])
  const [testForm, setTestForm] = useState({ name: '', testType: 'quantity', minValue: '', maxValue: '', unit: '' })

  // Per-group add-test forms
  const [addTestForGroup, setAddTestForGroup] = useState<string | null>(null)
  const [groupTestForm, setGroupTestForm] = useState({ name: '', testType: 'quantity', minValue: '', maxValue: '', unit: '' })
  const [savingGroupTest, setSavingGroupTest] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/quality/test-groups')
    setGroups(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function toggleGroup(id: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function addPendingTest() {
    if (!testForm.name) return
    setPendingTests(prev => [...prev, {
      name: testForm.name,
      testType: testForm.testType,
      minValue: testForm.minValue ? parseFloat(testForm.minValue) : null,
      maxValue: testForm.maxValue ? parseFloat(testForm.maxValue) : null,
      unit: testForm.unit || null,
    }])
    setTestForm({ name: '', testType: 'quantity', minValue: '', maxValue: '', unit: '' })
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!groupForm.name) return
    setSaving(true)
    const res = await fetch('/api/quality/test-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: groupForm.name,
        description: groupForm.description || undefined,
        tests: pendingTests,
      }),
    })
    if (res.ok) {
      setShowGroupForm(false)
      setGroupForm({ name: '', description: '' })
      setPendingTests([])
      load()
    }
    setSaving(false)
  }

  async function handleDeleteGroup(id: string) {
    if (!confirm('Delete this test group?')) return
    await fetch(`/api/quality/test-groups/${id}`, { method: 'DELETE' })
    load()
  }

  async function handleAddTestToGroup(e: React.FormEvent, groupId: string) {
    e.preventDefault()
    if (!groupTestForm.name) return
    setSavingGroupTest(true)
    const res = await fetch(`/api/quality/test-groups/${groupId}/tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: groupTestForm.name,
        testType: groupTestForm.testType,
        minValue: groupTestForm.minValue ? parseFloat(groupTestForm.minValue) : null,
        maxValue: groupTestForm.maxValue ? parseFloat(groupTestForm.maxValue) : null,
        unit: groupTestForm.unit || null,
      }),
    })
    if (res.ok) {
      setAddTestForGroup(null)
      setGroupTestForm({ name: '', testType: 'quantity', minValue: '', maxValue: '', unit: '' })
      load()
    }
    setSavingGroupTest(false)
  }

  return (
    <>
      <TopBar title="Test Groups" />
      <main className="flex-1 p-6 overflow-auto">

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-zinc-500">{groups.length} test group{groups.length !== 1 ? 's' : ''}</p>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowGroupForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Group
          </Button>
        </div>

        {/* New Group Form */}
        {showGroupForm && (
          <Card className="bg-zinc-900 border-zinc-700 mb-6">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-100">New Test Group</h3>
                <button onClick={() => setShowGroupForm(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateGroup}>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Group Name *</label>
                    <Input
                      value={groupForm.name}
                      onChange={e => setGroupForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Incoming Inspection"
                      required
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-8"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Description</label>
                    <Input
                      value={groupForm.description}
                      onChange={e => setGroupForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Optional"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-8"
                    />
                  </div>
                </div>

                {/* Pending Tests */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-zinc-400 mb-2">Tests ({pendingTests.length})</h4>
                  {pendingTests.map((t, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5 border-b border-zinc-800 text-xs text-zinc-300">
                      <span className="font-medium">{t.name}</span>
                      <span className="text-zinc-500 capitalize">{t.testType}</span>
                      {(t.minValue != null || t.maxValue != null) && (
                        <span className="text-zinc-500">
                          {t.minValue != null ? `≥${t.minValue}` : ''} {t.maxValue != null ? `≤${t.maxValue}` : ''} {t.unit ?? ''}
                        </span>
                      )}
                      <button
                        type="button"
                        className="ml-auto text-zinc-600 hover:text-red-400"
                        onClick={() => setPendingTests(prev => prev.filter((_, j) => j !== i))}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <div className="grid grid-cols-5 gap-2 mt-3">
                    <Input
                      value={testForm.name}
                      onChange={e => setTestForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Test name"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs h-7 col-span-2"
                    />
                    <select
                      value={testForm.testType}
                      onChange={e => setTestForm(f => ({ ...f, testType: e.target.value }))}
                      className="bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs h-7 rounded px-2"
                    >
                      <option value="quantity">Quantity</option>
                      <option value="boolean">Boolean</option>
                      <option value="fraction">Fraction</option>
                    </select>
                    <Input
                      value={testForm.minValue}
                      onChange={e => setTestForm(f => ({ ...f, minValue: e.target.value }))}
                      placeholder="Min"
                      type="number"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs h-7"
                    />
                    <Input
                      value={testForm.maxValue}
                      onChange={e => setTestForm(f => ({ ...f, maxValue: e.target.value }))}
                      placeholder="Max"
                      type="number"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs h-7"
                    />
                    <Input
                      value={testForm.unit}
                      onChange={e => setTestForm(f => ({ ...f, unit: e.target.value }))}
                      placeholder="Unit"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs h-7"
                    />
                    <Button type="button" size="sm" variant="ghost" className="text-blue-400 text-xs h-7" onClick={addPendingTest}>
                      + Add Test
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowGroupForm(false)} className="text-zinc-400">Cancel</Button>
                  <Button type="submit" size="sm" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {saving ? 'Creating...' : 'Create Group'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Groups List */}
        {loading ? (
          <p className="text-zinc-600 text-sm">Loading...</p>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <Beaker className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No test groups yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map(group => {
              const isOpen = expandedGroups.has(group.id)
              return (
                <Card key={group.id} className="bg-zinc-900 border-zinc-800">
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-800/40 transition-colors"
                    onClick={() => toggleGroup(group.id)}
                  >
                    {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
                    <Beaker className="w-4 h-4 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-100">{group.name}</p>
                      {group.description && <p className="text-xs text-zinc-500">{group.description}</p>}
                    </div>
                    <Badge variant="secondary" className="text-xs">{group.tests.length} test{group.tests.length !== 1 ? 's' : ''}</Badge>
                    <button
                      className="text-zinc-600 hover:text-red-400 transition-colors ml-2"
                      onClick={e => { e.stopPropagation(); handleDeleteGroup(group.id) }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="border-t border-zinc-800">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-zinc-800/60">
                            <th className="text-left px-6 py-2 text-xs text-zinc-500 font-medium">Test Name</th>
                            <th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Type</th>
                            <th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Min</th>
                            <th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Max</th>
                            <th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Unit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.tests.map(t => (
                            <tr key={t.id} className="border-b border-zinc-800/30">
                              <td className="px-6 py-2 text-zinc-200 text-xs">{t.name}</td>
                              <td className="px-4 py-2 text-zinc-400 text-xs capitalize">{t.testType}</td>
                              <td className="px-4 py-2 text-zinc-400 text-xs">{t.minValue ?? '—'}</td>
                              <td className="px-4 py-2 text-zinc-400 text-xs">{t.maxValue ?? '—'}</td>
                              <td className="px-4 py-2 text-zinc-400 text-xs">{t.unit ?? '—'}</td>
                            </tr>
                          ))}
                          {group.tests.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-3 text-zinc-600 text-xs">No tests in this group</td></tr>
                          )}
                        </tbody>
                      </table>

                      {/* Add test to group inline */}
                      {addTestForGroup === group.id ? (
                        <div className="px-6 py-3 border-t border-zinc-800/60">
                          <form onSubmit={e => handleAddTestToGroup(e, group.id)} className="flex items-center gap-2 flex-wrap">
                            <Input
                              value={groupTestForm.name}
                              onChange={e => setGroupTestForm(f => ({ ...f, name: e.target.value }))}
                              placeholder="Test name"
                              required
                              className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs h-7 w-36"
                            />
                            <select
                              value={groupTestForm.testType}
                              onChange={e => setGroupTestForm(f => ({ ...f, testType: e.target.value }))}
                              className="bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs h-7 rounded px-2"
                            >
                              <option value="quantity">Quantity</option>
                              <option value="boolean">Boolean</option>
                              <option value="fraction">Fraction</option>
                            </select>
                            <Input
                              value={groupTestForm.minValue}
                              onChange={e => setGroupTestForm(f => ({ ...f, minValue: e.target.value }))}
                              placeholder="Min"
                              type="number"
                              className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs h-7 w-16"
                            />
                            <Input
                              value={groupTestForm.maxValue}
                              onChange={e => setGroupTestForm(f => ({ ...f, maxValue: e.target.value }))}
                              placeholder="Max"
                              type="number"
                              className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs h-7 w-16"
                            />
                            <Input
                              value={groupTestForm.unit}
                              onChange={e => setGroupTestForm(f => ({ ...f, unit: e.target.value }))}
                              placeholder="Unit"
                              className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs h-7 w-16"
                            />
                            <Button type="submit" size="sm" disabled={savingGroupTest} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7">
                              {savingGroupTest ? '...' : 'Add'}
                            </Button>
                            <Button type="button" variant="ghost" size="sm" className="text-zinc-500 text-xs h-7" onClick={() => setAddTestForGroup(null)}>Cancel</Button>
                          </form>
                        </div>
                      ) : (
                        <div className="px-6 py-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-400 hover:text-blue-300 text-xs h-7"
                            onClick={() => setAddTestForGroup(group.id)}
                          >
                            <Plus className="w-3 h-3 mr-1" /> Add Test
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
