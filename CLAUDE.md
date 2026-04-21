# CLAUDE.md — VIP Brain Context Loader
# This file is read automatically by Claude Code at the start of every session.
# It loads Charlie's full brain context from the local brain server.

## HOW TO LOAD THE BRAIN

At the start of every session, run this to get full context:

```bash
curl -s http://localhost:3001/context 2>/dev/null || echo "Brain server offline — start with: node C:\\Projects\\BRAIN\\server.js"
```

If the brain server is offline, start it:
```bash
node C:\Projects\BRAIN\server.js
```

---

## IDENTITY
- Owner: Charlie (VIPTwisted on GitHub)
- Style: Direct commands, full execution expected, no partial implementations
- All work is confidential — private repos only

---

## LOCKED RULES — NEVER VIOLATE THESE

1. **TOPG Gemini palette ONLY** — `#00e5ff` cyan, `#7c4dff` purple, `#00b0ff` blue, `#1de9b6` teal, `#e040fb` pink. ZERO gold/yellow. No theme changes without explicit approval.
2. **Multifamily Suite: ES5 JS ONLY** — no backticks, no arrow functions, no const/let
3. **Dynasty Trust** — content from uploaded docs only. Never improvise. LOCAL ONLY, never push to GitHub.
4. **Wedding ecard** — tropical background LOCKED, never change
5. **Once a section is approved, never modify it**
6. **Re-uploaded working files are the authoritative base** — Claude's prior output is superseded
7. **Single-file HTML preferred** for all apps
8. **Never delete files on Charlie's computer** unless explicitly instructed
9. **Secrets always in env vars** — never hardcoded
10. **Private repos only** by default

---

## ACTIVE PROJECTS

| Project | Status | Repo |
|---|---|---|
| TopG Trading Institute | Active | topg-trading-institute |
| Hooked on Italy | Active | hooked-on-italy |
| Rapid Funding Back Office | Planning | rapid-funding-backoffice |
| Dynasty Trust | Active | LOCAL ONLY |
| Telegram SPX Bot | Live | telegram-spx-alert-bot |
| Multifamily Finance Suite | Active | local |
| ToyParty GCC | Built | — |
| Twisted Growers | Active | — |

---

## STACK PREFERENCES
- Single-file HTML + Vanilla JS (default)
- Claude API with ZDR
- Replit + SQLite for back-office apps
- Netlify for deployment
- Node.js for servers and bots
- gh CLI for GitHub operations

---

## GITHUB
- Username: VIPTwisted → local: `C:\Projects\`
- Username 2: GhostEngine → local: `C:\Projects\GhostEngine\`
- Org: TP-HEADQUARTERS
- Switch accounts: `gh auth switch`
- Brain server: `http://localhost:3001`

---

## QUICK BRAIN API REFERENCE

```
GET  http://localhost:3001/context           # Full brain
GET  http://localhost:3001/projects          # All projects
GET  http://localhost:3001/project/:name     # One project
GET  http://localhost:3001/rules             # Locked rules
GET  http://localhost:3001/todos             # All todos
GET  http://localhost:3001/repos             # All GitHub repos
GET  http://localhost:3001/repo/:name/files  # Repo file list
GET  http://localhost:3001/search?q=term     # Search GitHub code
POST http://localhost:3001/update            # Update brain memory
```

---

## SESSION START CHECKLIST
1. Check brain server: `curl http://localhost:3001/health`
2. Load project context: `curl http://localhost:3001/project/PROJECT_NAME`
3. Check recent commits: `curl http://localhost:3001/repo/REPO_NAME/commits`
4. Get todos: `curl http://localhost:3001/todos`
