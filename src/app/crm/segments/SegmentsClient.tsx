'use client'
import { useEffect, useState, useCallback } from 'react'
import {
  Users2, Plus, Copy, UserPlus, UserMinus, BookMarked, Search,
  ChevronRight, ChevronDown, ChevronUp, X, Calendar, User,
  SlidersHorizontal, MapPin, ShoppingBag, Check, Filter
} from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Segment {
  id: string
  segmentNo: string
  description: string
  salesperson: string
  segmentDate: string
  campaignNo: string
  campaignDescription: string
  noOfContacts: number
  lastUpdated: string
  industry: string
  region: string
}

interface CriteriaState {
  ageMin: number
  ageMax: number
  purchaseMin: number
  purchaseMax: number
  industry: string
  region: string
  contactType: string
  lastPurchaseDays: number
}

type SortKey = keyof Pick<Segment, 'segmentNo' | 'description' | 'salesperson' | 'segmentDate' | 'campaignNo' | 'noOfContacts' | 'lastUpdated'>
type SortDir = 'asc' | 'desc'
type DrawerTab = 'Criteria' | 'Contacts' | 'History'

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_SEGMENTS: Segment[] = [
  { id: '1',  segmentNo: 'SEG-0001', description: 'High-Value Retail Partners',      salesperson: 'J. Rivera',   segmentDate: '2026-04-01', campaignNo: 'CAMP-0001', campaignDescription: 'Spring Promo 2026',       noOfContacts: 480, lastUpdated: '2026-04-18', industry: 'Retail',      region: 'Northeast' },
  { id: '2',  segmentNo: 'SEG-0002', description: 'VIP Members Tier 1',              salesperson: 'A. Chen',     segmentDate: '2026-01-15', campaignNo: 'CAMP-0002', campaignDescription: 'VIP Loyalty Outreach',    noOfContacts: 320, lastUpdated: '2026-04-10', industry: 'Mixed',       region: 'National'  },
  { id: '3',  segmentNo: 'SEG-0003', description: 'Wholesale Q1 Prospects',          salesperson: 'M. Johnson',  segmentDate: '2026-01-05', campaignNo: 'CAMP-0003', campaignDescription: 'Q1 Wholesale Push',       noOfContacts: 210, lastUpdated: '2026-03-31', industry: 'Wholesale',   region: 'Midwest'   },
  { id: '4',  segmentNo: 'SEG-0004', description: 'New Product Launch List',         salesperson: 'K. Williams', segmentDate: '2026-03-20', campaignNo: 'CAMP-0004', campaignDescription: 'New Product Launch',      noOfContacts: 550, lastUpdated: '2026-04-15', industry: 'Mixed',       region: 'National'  },
  { id: '5',  segmentNo: 'SEG-0005', description: 'Trade Show Attendees 2026',       salesperson: 'J. Rivera',   segmentDate: '2026-02-01', campaignNo: 'CAMP-0005', campaignDescription: 'Retail Partner Engagement', noOfContacts: 310, lastUpdated: '2026-04-05', industry: 'Retail',     region: 'West'      },
  { id: '6',  segmentNo: 'SEG-0006', description: 'Lapsed Customers 6M',             salesperson: 'A. Chen',     segmentDate: '2026-03-10', campaignNo: 'CAMP-0007', campaignDescription: 'Customer Win-Back 2026',  noOfContacts: 290, lastUpdated: '2026-04-12', industry: 'Mixed',       region: 'Southeast' },
  { id: '7',  segmentNo: 'SEG-0007', description: 'Summer Clearance Targets',        salesperson: 'M. Johnson',  segmentDate: '2026-04-05', campaignNo: 'CAMP-0006', campaignDescription: 'Summer Clearance Sale',   noOfContacts: 620, lastUpdated: '2026-04-20', industry: 'Retail',      region: 'National'  },
  { id: '8',  segmentNo: 'SEG-0008', description: 'B2B Technology Sector',           salesperson: 'K. Williams', segmentDate: '2026-02-14', campaignNo: 'CAMP-0009', campaignDescription: 'B2B Referral Drive',      noOfContacts: 145, lastUpdated: '2026-03-15', industry: 'Technology',  region: 'West'      },
  { id: '9',  segmentNo: 'SEG-0009', description: 'Newsletter Subscribers Active',   salesperson: 'J. Rivera',   segmentDate: '2026-01-20', campaignNo: 'CAMP-0013', campaignDescription: 'Newsletter Relaunch',     noOfContacts: 1240,lastUpdated: '2026-04-01', industry: 'Mixed',       region: 'National'  },
  { id: '10', segmentNo: 'SEG-0010', description: 'Premium Upsell Candidates',       salesperson: 'A. Chen',     segmentDate: '2026-04-08', campaignNo: 'CAMP-0016', campaignDescription: 'Premium Account Upsell',  noOfContacts: 88,  lastUpdated: '2026-04-19', industry: 'Mixed',       region: 'Northeast' },
  { id: '11', segmentNo: 'SEG-0011', description: 'Distributor Network North',       salesperson: 'M. Johnson',  segmentDate: '2026-03-01', campaignNo: 'CAMP-0014', campaignDescription: 'Distributor Incentive',   noOfContacts: 165, lastUpdated: '2026-04-08', industry: 'Wholesale',   region: 'Northeast' },
  { id: '12', segmentNo: 'SEG-0012', description: 'Back-to-School Buyers',           salesperson: 'K. Williams', segmentDate: '2026-04-10', campaignNo: 'CAMP-0017', campaignDescription: 'Back-to-School Supplies', noOfContacts: 430, lastUpdated: '2026-04-21', industry: 'Retail',      region: 'National'  },
  { id: '13', segmentNo: 'SEG-0013', description: 'Reorder Frequent Buyers',         salesperson: 'J. Rivera',   segmentDate: '2026-03-18', campaignNo: 'CAMP-0018', campaignDescription: 'Reorder Reminder Blast',  noOfContacts: 410, lastUpdated: '2026-04-16', industry: 'Mixed',       region: 'Midwest'   },
  { id: '14', segmentNo: 'SEG-0014', description: 'Event RSVP — Partner Portal',     salesperson: 'A. Chen',     segmentDate: '2026-02-10', campaignNo: 'CAMP-0020', campaignDescription: 'Partner Portal Launch',   noOfContacts: 165, lastUpdated: '2026-04-14', industry: 'Technology',  region: 'West'      },
  { id: '15', segmentNo: 'SEG-0015', description: 'Holiday Shoppers 2025',           salesperson: 'M. Johnson',  segmentDate: '2025-11-01', campaignNo: 'CAMP-0015', campaignDescription: 'End-of-Year Blowout',     noOfContacts: 2800,lastUpdated: '2026-01-05', industry: 'Retail',      region: 'National'  },
  { id: '16', segmentNo: 'SEG-0016', description: 'Influencer Followers Converted',  salesperson: 'K. Williams', segmentDate: '2025-10-15', campaignNo: 'CAMP-0019', campaignDescription: 'Influencer Collaboration',noOfContacts: 330, lastUpdated: '2026-01-20', industry: 'Mixed',       region: 'National'  },
  { id: '17', segmentNo: 'SEG-0017', description: 'Southeast Retail Expansion',      salesperson: 'J. Rivera',   segmentDate: '2026-03-25', campaignNo: 'CAMP-0005', campaignDescription: 'Retail Partner Engagement', noOfContacts: 250, lastUpdated: '2026-04-17', industry: 'Retail',     region: 'Southeast' },
  { id: '18', segmentNo: 'SEG-0018', description: 'Cold Outreach — Tech Sector',     salesperson: 'A. Chen',     segmentDate: '2026-04-12', campaignNo: 'CAMP-0009', campaignDescription: 'B2B Referral Drive',      noOfContacts: 117, lastUpdated: '2026-04-22', industry: 'Technology',  region: 'West'      },
]

const SALESPERSONS = ['J. Rivera', 'A. Chen', 'M. Johnson', 'K. Williams']
const CAMPAIGN_NOS = [...new Set(MOCK_SEGMENTS.map(s => s.campaignNo))]
const INDUSTRIES = ['Retail', 'Wholesale', 'Technology', 'Mixed']
const REGIONS = ['National', 'Northeast', 'Midwest', 'Southeast', 'West']
const CONTACT_TYPES = ['All', 'Customer', 'Prospect', 'Partner', 'Lead']
const CRITERIA_TYPES = ['Age Range', 'Purchase History', 'Industry', 'Region', 'Contact Type', 'Last Purchase']

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function contactBarWidth(n: number, max: number) {
  return max > 0 ? Math.round((n / max) * 100) : 0
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
function SegmentDrawer({ segment, onClose }: { segment: Segment; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('Criteria')
  const tabs: DrawerTab[] = ['Criteria', 'Contacts', 'History']

  const [criteria, setCriteria] = useState<CriteriaState>({
    ageMin: 25, ageMax: 65,
    purchaseMin: 500, purchaseMax: 50000,
    industry: segment.industry,
    region: segment.region,
    contactType: 'All',
    lastPurchaseDays: 180,
  })

  function updateCriteria<K extends keyof CriteriaState>(key: K, val: CriteriaState[K]) {
    setCriteria(c => ({ ...c, [key]: val }))
  }

  const mockContacts = Array.from({ length: Math.min(8, segment.noOfContacts) }, (_, i) => ({
    name: ['Smith Corp', 'Blue Ridge Retail', 'Apex Wholesale', 'NovaTech', 'Pacific Partners',
           'Heartland Dist.', 'Summit Group', 'Cascade LLC'][i % 8],
    type: ['Customer', 'Prospect', 'Partner', 'Lead', 'Customer', 'Partner', 'Customer', 'Prospect'][i % 8],
    lastContact: ['2026-04-10', '2026-04-08', '2026-03-22', '2026-04-15', '2026-04-01',
                  '2026-03-30', '2026-04-18', '2026-04-05'][i % 8],
  }))

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div
        className="w-[480px] h-full flex flex-col shadow-2xl border-l border-zinc-800/70"
        style={{ background: '#16213e' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-zinc-800/60">
          <div>
            <p className="text-[11px] text-zinc-500 font-mono mb-0.5">{segment.segmentNo}</p>
            <h2 className="text-base font-semibold text-white leading-tight">{segment.description}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                <User className="w-3 h-3 text-zinc-500" />{segment.salesperson}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-indigo-400">
                <BookMarked className="w-3 h-3" />{segment.campaignNo}
              </span>
              <span className="text-[11px] text-zinc-500">{segment.noOfContacts.toLocaleString()} contacts</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-zinc-700/60 text-zinc-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FastTabs */}
        <div className="flex border-b border-zinc-800/60 px-5">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                activeTab === t
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {activeTab === 'Criteria' && (
            <div className="space-y-5">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Segment Criteria</p>

              {/* Age Range Slider */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[11px] text-zinc-400">Age Range</label>
                  <span className="text-[11px] text-zinc-300 font-mono">{criteria.ageMin} – {criteria.ageMax}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <input type="range" min={18} max={criteria.ageMax - 1} value={criteria.ageMin}
                    onChange={e => updateCriteria('ageMin', Number(e.target.value))}
                    className="flex-1 accent-indigo-500" />
                  <input type="range" min={criteria.ageMin + 1} max={85} value={criteria.ageMax}
                    onChange={e => updateCriteria('ageMax', Number(e.target.value))}
                    className="flex-1 accent-indigo-500" />
                </div>
              </div>

              {/* Purchase History Slider */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[11px] text-zinc-400">Annual Purchase ($)</label>
                  <span className="text-[11px] text-zinc-300 font-mono">${criteria.purchaseMin.toLocaleString()} – ${criteria.purchaseMax.toLocaleString()}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <input type="range" min={0} max={criteria.purchaseMax - 100} step={100} value={criteria.purchaseMin}
                    onChange={e => updateCriteria('purchaseMin', Number(e.target.value))}
                    className="flex-1 accent-indigo-500" />
                  <input type="range" min={criteria.purchaseMin + 100} max={200000} step={100} value={criteria.purchaseMax}
                    onChange={e => updateCriteria('purchaseMax', Number(e.target.value))}
                    className="flex-1 accent-indigo-500" />
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1.5">Industry</label>
                <div className="flex flex-wrap gap-1.5">
                  {INDUSTRIES.map(ind => (
                    <button
                      key={ind}
                      onClick={() => updateCriteria('industry', ind)}
                      className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                        criteria.industry === ind
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >{ind}</button>
                  ))}
                </div>
              </div>

              {/* Region */}
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Geography / Region
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {REGIONS.map(r => (
                    <button
                      key={r}
                      onClick={() => updateCriteria('region', r)}
                      className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                        criteria.region === r
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >{r}</button>
                  ))}
                </div>
              </div>

              {/* Contact Type */}
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1.5">Contact Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {CONTACT_TYPES.map(ct => (
                    <button
                      key={ct}
                      onClick={() => updateCriteria('contactType', ct)}
                      className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                        criteria.contactType === ct
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >{ct}</button>
                  ))}
                </div>
              </div>

              {/* Last Purchase Days */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3" /> Last Purchase (within days)
                  </label>
                  <span className="text-[11px] text-zinc-300 font-mono">{criteria.lastPurchaseDays}d</span>
                </div>
                <input type="range" min={7} max={730} step={7} value={criteria.lastPurchaseDays}
                  onChange={e => updateCriteria('lastPurchaseDays', Number(e.target.value))}
                  className="w-full accent-indigo-500" />
                <div className="flex justify-between mt-0.5">
                  <span className="text-[10px] text-zinc-600">7 days</span>
                  <span className="text-[10px] text-zinc-600">2 years</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors">
                  <Filter className="w-3.5 h-3.5" /> Apply Criteria
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Contacts' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-zinc-300">Contact List</p>
                <span className="text-xs text-indigo-400 font-mono">{segment.noOfContacts.toLocaleString()} total</span>
              </div>
              <div className="space-y-0.5">
                {mockContacts.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-zinc-800/40">
                    <div>
                      <p className="text-xs text-zinc-200">{c.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Last contact: {fmtDate(c.lastContact)}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      c.type === 'Customer' ? 'bg-green-500/20 text-green-400' :
                      c.type === 'Partner'  ? 'bg-indigo-500/20 text-indigo-400' :
                      c.type === 'Lead'     ? 'bg-amber-500/20 text-amber-400' :
                      'bg-zinc-700/50 text-zinc-400'
                    }`}>{c.type}</span>
                  </div>
                ))}
                {segment.noOfContacts > 8 && (
                  <p className="text-[11px] text-zinc-500 pt-2 text-center">
                    + {(segment.noOfContacts - 8).toLocaleString()} more contacts
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'History' && (
            <div className="space-y-3">
              {[
                { date: '2026-04-22', action: 'Criteria Updated',    note: 'Age range and region filters modified', user: segment.salesperson },
                { date: '2026-04-15', action: 'Contacts Added',      note: '42 contacts added from import', user: 'System' },
                { date: '2026-04-08', action: 'Contacts Removed',    note: '12 unsubscribed contacts removed', user: 'System' },
                { date: '2026-04-01', action: 'Linked to Campaign',  note: `Segment linked to ${segment.campaignNo}`, user: segment.salesperson },
                { date: segment.segmentDate, action: 'Segment Created', note: 'Segment record created in NovaPOS', user: segment.salesperson },
              ].map((h, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1 flex-shrink-0" />
                    {i < 4 && <div className="w-px flex-1 bg-zinc-700/50 mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-zinc-300 font-medium">{h.action}</p>
                    <p className="text-zinc-500 mt-0.5">{h.note}</p>
                    <p className="text-zinc-600 mt-1">{fmtDate(h.date)} · {h.user}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Add Contacts Modal ────────────────────────────────────────────────────────
function AddContactsModal({ onClose }: { onClose: () => void }) {
  const [activeCriteria, setActiveCriteria] = useState<string[]>([])
  const [vals, setVals] = useState<Record<string, string>>({})

  function toggleCriteria(c: string) {
    setActiveCriteria(a => a.includes(c) ? a.filter(x => x !== c) : [...a, c])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-[560px] rounded-xl border border-zinc-700/60 shadow-2xl"
        style={{ background: '#16213e' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
          <div>
            <h3 className="text-sm font-semibold text-white">Add Contacts</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Build criteria to add matching contacts to segment</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-zinc-700/60 text-zinc-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-3">Select Criteria Types</p>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {CRITERIA_TYPES.map(c => (
              <button
                key={c}
                onClick={() => toggleCriteria(c)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs transition-colors ${
                  activeCriteria.includes(c)
                    ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-300'
                    : 'border-zinc-700/50 bg-zinc-800/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                }`}
              >
                <div className={`w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center ${
                  activeCriteria.includes(c) ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-600'
                }`}>
                  {activeCriteria.includes(c) && <Check className="w-2 h-2 text-white" />}
                </div>
                {c}
              </button>
            ))}
          </div>

          {activeCriteria.length > 0 && (
            <div className="space-y-3 border-t border-zinc-800/60 pt-4">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Configure Values</p>
              {activeCriteria.map(c => (
                <div key={c} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400 w-36 flex-shrink-0">{c}</span>
                  {c === 'Industry' && (
                    <select
                      value={vals[c] ?? ''}
                      onChange={e => setVals(v => ({ ...v, [c]: e.target.value }))}
                      className="flex-1 bg-zinc-900 border border-zinc-700/50 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                      style={{ color: '#e2e8f0' }}
                    >
                      <option value="">— Select —</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  )}
                  {c === 'Region' && (
                    <select
                      value={vals[c] ?? ''}
                      onChange={e => setVals(v => ({ ...v, [c]: e.target.value }))}
                      className="flex-1 bg-zinc-900 border border-zinc-700/50 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                      style={{ color: '#e2e8f0' }}
                    >
                      <option value="">— Select —</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  )}
                  {c === 'Contact Type' && (
                    <select
                      value={vals[c] ?? ''}
                      onChange={e => setVals(v => ({ ...v, [c]: e.target.value }))}
                      className="flex-1 bg-zinc-900 border border-zinc-700/50 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                      style={{ color: '#e2e8f0' }}
                    >
                      <option value="">— Select —</option>
                      {CONTACT_TYPES.slice(1).map(ct => <option key={ct} value={ct}>{ct}</option>)}
                    </select>
                  )}
                  {(c === 'Age Range' || c === 'Purchase History' || c === 'Last Purchase') && (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="flex-1 bg-zinc-900 border border-zinc-700/50 rounded px-2.5 py-1.5 text-xs placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                        style={{ color: '#e2e8f0' }}
                      />
                      <span className="text-zinc-600 text-xs">–</span>
                      <input
                        type="number"
                        placeholder="Max"
                        className="flex-1 bg-zinc-900 border border-zinc-700/50 rounded px-2.5 py-1.5 text-xs placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                        style={{ color: '#e2e8f0' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeCriteria.length === 0 && (
            <div className="text-center py-6 text-zinc-600 text-xs">
              Select one or more criteria types above to configure filters
            </div>
          )}
        </div>

        <div className="flex justify-between items-center px-6 py-4 border-t border-zinc-800/60">
          <span className="text-[11px] text-zinc-500">
            {activeCriteria.length > 0 ? `${activeCriteria.length} criteria selected` : 'No criteria selected'}
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs text-zinc-400 hover:text-white border border-zinc-700 rounded hover:bg-zinc-700/50 transition-colors">Cancel</button>
            <button
              onClick={onClose}
              disabled={activeCriteria.length === 0}
              className="px-4 py-2 text-xs text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add Contacts
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SegmentsClient() {
  const [rows, setRows] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [campaignFilter, setCampaignFilter] = useState('')
  const [salespersonFilter, setSalespersonFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('segmentNo')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showAddContacts, setShowAddContacts] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    fetch(`/api/crm/segments?${q}`)
      .then(r => r.json())
      .then(d => { setRows(Array.isArray(d) && d.length ? d : MOCK_SEGMENTS); setLoading(false) })
      .catch(() => { setRows(MOCK_SEGMENTS); setLoading(false) })
  }, [search])

  useEffect(() => { load() }, [load])

  // KPIs
  const totalSegments = rows.length
  const activeSegments = rows.filter(r => {
    const d = new Date(r.segmentDate)
    const now = new Date('2026-04-22')
    return d >= new Date(now.getFullYear(), now.getMonth() - 3, 1)
  }).length
  const totalContacts = rows.reduce((a, b) => a + b.noOfContacts, 0)
  const avgContacts = rows.length > 0 ? Math.round(totalContacts / rows.length) : 0

  // Filter + sort
  const filtered = rows
    .filter(r => {
      const term = search.toLowerCase()
      const matchSearch = !term || r.description.toLowerCase().includes(term) || r.segmentNo.toLowerCase().includes(term)
      const matchCampaign = !campaignFilter || r.campaignNo === campaignFilter
      const matchSalesperson = !salespersonFilter || r.salesperson === salespersonFilter
      const matchFrom = !dateFrom || r.segmentDate >= dateFrom
      const matchTo = !dateTo || r.segmentDate <= dateTo
      return matchSearch && matchCampaign && matchSalesperson && matchFrom && matchTo
    })
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const maxContacts = Math.max(...filtered.map(r => r.noOfContacts), 1)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown className="w-3 h-3 text-zinc-600 inline ml-0.5" />
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-indigo-400 inline ml-0.5" />
      : <ChevronDown className="w-3 h-3 text-indigo-400 inline ml-0.5" />
  }

  const ribbonActions = [
    { label: 'New',             icon: <Plus className="w-3.5 h-3.5" />,       onClick: () => setShowNewModal(true) },
    { label: 'Copy Segment',    icon: <Copy className="w-3.5 h-3.5" />,       onClick: () => {} },
    { label: 'Add Contacts',    icon: <UserPlus className="w-3.5 h-3.5" />,   onClick: () => setShowAddContacts(true) },
    { label: 'Remove Contacts', icon: <UserMinus className="w-3.5 h-3.5" />,  onClick: () => {} },
    { label: 'Log Segment',     icon: <BookMarked className="w-3.5 h-3.5" />, onClick: () => {} },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh]" style={{ background: '#0f0f1a', color: '#e2e8f0' }}>
      <TopBar
        title="Segments"
        breadcrumb={[{ label: 'CRM', href: '/crm' }]}
        actions={
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Segment
          </button>
        }
      />

      {/* D365 Action Ribbon */}
      <div className="flex items-center gap-1 px-4 py-1.5 border-b border-zinc-800/50" style={{ background: '#13132a' }}>
        {ribbonActions.map(a => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded transition-colors"
          >
            {a.icon}
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-zinc-800/50">
        {[
          { label: 'Total Segments',          value: totalSegments.toString(),        icon: <Users2 className="w-4 h-4 text-indigo-400" />,  color: 'text-white' },
          { label: 'Active (Last 3M)',         value: activeSegments.toString(),       icon: <Filter className="w-4 h-4 text-green-400" />,   color: 'text-green-400' },
          { label: 'Total Contacts',           value: totalContacts.toLocaleString(),  icon: <UserPlus className="w-4 h-4 text-cyan-400" />,  color: 'text-cyan-400' },
          { label: 'Avg Contacts / Segment',   value: avgContacts.toLocaleString(),    icon: <SlidersHorizontal className="w-4 h-4 text-amber-400" />, color: 'text-amber-400' },
        ].map(k => (
          <div key={k.label} className="rounded-lg border border-zinc-800/50 px-4 py-3 flex items-center gap-3" style={{ background: '#16213e' }}>
            <div className="p-2 rounded-lg bg-zinc-800/50">{k.icon}</div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{k.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${k.color}`}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Strip */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-zinc-800/50 flex-wrap" style={{ background: '#0f0f1a' }}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search segments..."
            className="w-52 bg-zinc-900 border border-zinc-700/50 rounded px-3 py-1.5 pl-8 text-xs placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            style={{ color: '#e2e8f0' }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <BookMarked className="w-3.5 h-3.5 text-zinc-500" />
          <select
            value={campaignFilter}
            onChange={e => setCampaignFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-700/50 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            style={{ color: '#e2e8f0' }}
          >
            <option value="">All Campaigns</option>
            {CAMPAIGN_NOS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-zinc-500" />
          <select
            value={salespersonFilter}
            onChange={e => setSalespersonFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-700/50 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            style={{ color: '#e2e8f0' }}
          >
            <option value="">All Salespersons</option>
            {SALESPERSONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="bg-zinc-900 border border-zinc-700/50 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            style={{ color: '#e2e8f0' }}
          />
          <span className="text-zinc-600 text-xs">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="bg-zinc-900 border border-zinc-700/50 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            style={{ color: '#e2e8f0' }}
          />
        </div>
        <span className="ml-auto text-[11px] text-zinc-500">{filtered.length} of {rows.length} records</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 border-b border-zinc-800/60 z-10" style={{ background: '#13132a' }}>
            <tr className="text-zinc-500 text-[10px] uppercase tracking-wider">
              {([
                ['segmentNo',   'Segment No.',    'left',  'w-32'],
                ['description', 'Description',    'left',  ''],
                ['salesperson', 'Salesperson',    'left',  'w-28'],
                ['segmentDate', 'Date',           'left',  'w-28'],
                ['campaignNo',  'Campaign',       'left',  'w-28'],
                ['noOfContacts','No. of Contacts','right', 'w-48'],
                ['lastUpdated', 'Last Updated',   'left',  'w-28'],
              ] as [SortKey, string, string, string][]).map(([key, label, align, cls]) => (
                <th
                  key={key}
                  className={`px-4 py-2.5 text-${align} ${cls} cursor-pointer hover:text-zinc-300 select-none`}
                  onClick={() => toggleSort(key)}
                >
                  {label} <SortIcon col={key} />
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {loading && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-zinc-500 text-xs">Loading segments…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-zinc-500 text-xs">No segments match your filters</td></tr>
            )}
            {!loading && filtered.map(row => (
              <tr
                key={row.id}
                onClick={() => setSelectedSegment(row)}
                className="cursor-pointer transition-colors hover:bg-zinc-800/30"
              >
                <td className="px-4 py-2.5 font-mono text-indigo-400 text-[11px]">{row.segmentNo}</td>
                <td className="px-4 py-2.5 font-medium" style={{ color: '#e2e8f0' }}>{row.description}</td>
                <td className="px-4 py-2.5 text-zinc-400">{row.salesperson}</td>
                <td className="px-4 py-2.5 text-zinc-400 text-[11px]">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-zinc-600" />{fmtDate(row.segmentDate)}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-[11px] text-indigo-400 font-mono hover:underline cursor-pointer">{row.campaignNo}</span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-24 bg-zinc-800 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-cyan-500"
                        style={{ width: `${contactBarWidth(row.noOfContacts, maxContacts)}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-zinc-300 w-12 text-right">{row.noOfContacts.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-zinc-500 text-[11px]">{fmtDate(row.lastUpdated)}</td>
                <td className="px-3 py-2.5"><ChevronRight className="w-3.5 h-3.5 text-zinc-600" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {selectedSegment && (
        <SegmentDrawer segment={selectedSegment} onClose={() => setSelectedSegment(null)} />
      )}

      {/* Add Contacts Modal */}
      {showAddContacts && (
        <AddContactsModal onClose={() => setShowAddContacts(false)} />
      )}

      {/* New Segment placeholder modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowNewModal(false)}>
          <div
            className="w-[480px] rounded-xl border border-zinc-700/60 shadow-2xl"
            style={{ background: '#16213e' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
              <h3 className="text-sm font-semibold text-white">New Segment</h3>
              <button onClick={() => setShowNewModal(false)} className="p-1.5 rounded hover:bg-zinc-700/60 text-zinc-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Description *</label>
                <input className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs placeholder-zinc-600 focus:outline-none focus:border-indigo-500" placeholder="Segment description" style={{ color: '#e2e8f0' }} />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Salesperson</label>
                <select className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500" style={{ color: '#e2e8f0' }}>
                  <option value="">— Select —</option>
                  {SALESPERSONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Campaign</label>
                <select className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500" style={{ color: '#e2e8f0' }}>
                  <option value="">— None —</option>
                  {CAMPAIGN_NOS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Segment Date</label>
                <input type="date" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500" style={{ color: '#e2e8f0' }} />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Industry</label>
                <select className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500" style={{ color: '#e2e8f0' }}>
                  <option value="">— Select —</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-zinc-800/60">
              <button onClick={() => setShowNewModal(false)} className="px-4 py-2 text-xs text-zinc-400 hover:text-white border border-zinc-700 rounded hover:bg-zinc-700/50 transition-colors">Cancel</button>
              <button onClick={() => setShowNewModal(false)} className="px-4 py-2 text-xs text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Create Segment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
