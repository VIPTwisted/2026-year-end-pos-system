import { NextRequest, NextResponse as NR } from 'next/server'

// In-memory config (persists for process lifetime; swap for DB model if needed)
let copilotConfig = {
  features: {
    caseSummary:         true,
    emailDraft:          true,
    knowledgeSuggest:    true,
    sentimentDetection:  false,
    autoCloseSuggestions: false,
  },
  stats: {
    suggestionsShown:    1240,
    accepted:            876,
    rejected:            364,
  },
  knowledge: {
    articlesConnected: 142,
    lastIndexed:       new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  auditLog: [
    { id: '1', caseId: 'CS-1021', action: 'case_summary',   agent: 'J. Rivera',  outcome: 'accepted', ts: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
    { id: '2', caseId: 'CS-1020', action: 'email_draft',    agent: 'M. Patel',   outcome: 'edited',   ts: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
    { id: '3', caseId: 'CS-1019', action: 'knowledge_suggest', agent: 'T. Wu',   outcome: 'accepted', ts: new Date(Date.now() - 55 * 60 * 1000).toISOString() },
    { id: '4', caseId: 'CS-1018', action: 'sentiment',      agent: 'J. Rivera',  outcome: 'dismissed',ts: new Date(Date.now() - 80 * 60 * 1000).toISOString() },
    { id: '5', caseId: 'CS-1017', action: 'auto_close',     agent: 'M. Patel',   outcome: 'accepted', ts: new Date(Date.now() - 120 * 60 * 1000).toISOString() },
  ],
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const { stats } = copilotConfig
  const acceptanceRate = stats.suggestionsShown > 0
    ? ((stats.accepted / stats.suggestionsShown) * 100).toFixed(1)
    : '0.0'
  return NR.json({ ...copilotConfig, acceptanceRate })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  if (body.feature && body.enabled !== undefined) {
    copilotConfig.features = {
      ...copilotConfig.features,
      [body.feature]: body.enabled,
    }
  }
  return NR.json({ ok: true, features: copilotConfig.features })
}
