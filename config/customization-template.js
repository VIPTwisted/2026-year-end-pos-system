/**
 * NovaPOS — Central Customization Template
 *
 * PHASE 2 CUSTOMIZATION POINT
 * Edit this file to rebrand or white-label the entire platform.
 * Import from this file anywhere you need configurable values.
 */

const NovaPOSConfig = {
  // ─── Brand Identity ────────────────────────────────────────────────────────
  brand: {
    name: 'NovaPOS',                         // Platform name (sidebar, titles, footers)
    tagline: 'Enterprise Platform',          // Subtitle shown in sidebar
    logoInitial: 'N',                        // Letter shown in the logo box
    logoColor: 'bg-blue-600',                // Tailwind class for logo background
    version: '1.0.0',
    copyright: 'NovaPOS Inc.',
  },

  // ─── Product Names ──────────────────────────────────────────────────────────
  products: {
    core: 'NovaPOS Core Finance',            // Replaces "Business Central"
    flex: 'NovaPOS Flex',                    // Replaces "Dynamics 365"
    training: 'NovaPOS Training Center',
    moduleMap: 'NovaPOS Module Map',
  },

  // ─── Database ──────────────────────────────────────────────────────────────
  database: {
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  },

  // ─── Feature Flags (Phase 2) ────────────────────────────────────────────────
  features: {
    posTerminal: true,
    fixedAssets: true,
    payroll: true,
    taxManagement: true,
    budgetPlans: true,
    warehouse: true,
    training: true,
    d365Map: true,                           // Module map page
    yearEndClose: true,
    bankReconciliation: true,
  },

  // ─── Localization ──────────────────────────────────────────────────────────
  locale: {
    currency: 'USD',
    currencySymbol: '$',
    dateFormat: 'en-US',
    timezone: 'America/New_York',
  },

  // ─── Theme Tokens (Phase 2 — wire into tailwind.config.ts) ────────────────
  theme: {
    accentColor: '#2563eb',                  // blue-600
    accentHover: '#3b82f6',                  // blue-500
    background: '#09090b',                   // zinc-950
    surface: '#18181b',                      // zinc-900
    border: '#27272a',                       // zinc-800
    textPrimary: '#f4f4f5',                  // zinc-100
    textMuted: '#71717a',                    // zinc-500
  },
}

module.exports = NovaPOSConfig
