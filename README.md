# NovaPOS — Enterprise Platform

A full-stack enterprise ERP and POS platform built on Next.js 15, Prisma, and TypeScript. Modeled on enterprise finance workflows with a modern dark-UI design system.

## Features

- **POS Terminal** — full cart, payment, and receipt flow
- **Finance Suite** — GL Journal, Chart of Accounts, AP/AR lifecycle, posting profiles
- **Fixed Assets** — acquisition, straight-line/declining-balance/SYD depreciation, disposal
- **Budget Plans** — actuals vs. budget by account, variance analysis
- **Tax Management** — tax codes, rates, transaction ledger, net liability
- **Payroll** — pay periods, gross/net pay, deductions
- **Bank** — account management, statement reconciliation
- **Fiscal Calendar** — FY periods, year-end close wizard
- **Warehouse (WMS)** — location → zone → rack → bin → bin-content hierarchy
- **Training Center** — interactive finance workflow documentation
- **Reports** — P&L, Balance Sheet, Trial Balance, AR Aging
- **NovaPOS Module Map** — 27-module visual progress tracker

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| ORM | Prisma 7 + SQLite |
| UI | Tailwind CSS v4 + Radix UI |
| Icons | Lucide React |
| Charts | Recharts |

## Quick Start

```bash
# Install dependencies
npm install

# Push schema to database
npm run db:push

# Seed demo data
npm run db:seed

# Start development server (HMR enabled)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev          # Development server with HMR
npm run build        # Production build
npm run db:push      # Sync schema to database (non-destructive)
npm run db:seed      # Populate demo data
npm run db:studio    # Open Prisma Studio (database browser)
```

## Customization

Edit `config/customization-template.js` to rebrand or white-label the platform:

- Brand name, logo initial, tagline
- Product names (Core Finance, Flex)
- Feature flags (enable/disable modules)
- Theme color tokens
- Locale and currency

Look for `// PHASE 2 CUSTOMIZATION POINT` comments throughout the codebase for additional hook points.

## Project Structure

```
src/
  app/               # Next.js App Router pages
    finance/         # GL, Fixed Assets, Tax, Posting Profiles
    budget/          # Budget Plans + entries
    hr/              # HR overview + Payroll
    ar/              # Accounts Receivable
    vendors/         # Accounts Payable + Vendor management
    bank/            # Bank accounts + reconciliation
    reports/         # Financial statements
    training/        # Training center
  components/
    layout/          # Sidebar, TopBar
    ui/              # Shared UI primitives (Button, Card, Badge, etc.)
  lib/               # Prisma client, utils, training data
prisma/
  schema.prisma      # Full database schema (50+ models)
  seed.ts            # Demo data seed script
config/
  customization-template.js  # Central branding/feature control
```

## Database Schema Highlights

- **Core POS**: Store, Product, Category, Customer, Order, Inventory
- **Finance**: Account, JournalEntry, JournalLine, FiscalYear, FiscalPeriod
- **AP**: VendorGroup, Vendor, VendorInvoice, VendorPayment
- **AR**: CustomerInvoice, CustomerPaymentSettlement
- **Bank**: BankAccount, BankStatement, BankStatementLine
- **Fixed Assets**: FixedAssetGroup, FixedAsset, AssetDepreciation
- **Budget**: BudgetPlan, BudgetEntry
- **Tax**: TaxCode, TaxTransaction
- **Payroll**: PayrollPeriod, PayrollEntry
- **WMS**: WmsLocation, WmsZone, WmsRack, WmsBin, WmsBinContent, WmsEntry
- **HR**: Employee, Shift, ShiftAssignment
