'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderSource = 'Website' | 'Mobile App' | 'B2B Portal' | 'Marketplace'
type OrderStatus = 'New' | 'Processing' | 'Picked' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded'
type PaymentStatus = 'Authorized' | 'Captured' | 'Net 30' | 'Marketplace Pay'

interface OrderLine {
  sku: string
  name: string
  qty: number
  price: number
}

interface Order {
  id: string
  orderNum: string
  source: OrderSource
  customer: string
  company?: string
  itemCount: number
  total: number
  payment: string
  shipMethod: string
  status: OrderStatus
  placedAt: string
  address: { line1: string; city: string; state: string; zip: string }
  billing: { line1: string; city: string; state: string; zip: string }
  lines: OrderLine[]
  tracking?: string
  warehouse: string
  pickStatus: string
  authCode: string
  paymentStatus: PaymentStatus
  timeline: string[]
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function WebsiteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <circle cx="12" cy="12" r="9" /><path d="M3.6 9h16.8M3.6 15h16.8M12 3c-2.5 3-3.9 5.8-3.9 9s1.4 6 3.9 9M12 3c2.5 3 3.9 5.8 3.9 9s-1.4 6-3.9 9" />
    </svg>
  )
}

function MobileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <rect x="7" y="2" width="10" height="20" rx="2" /><circle cx="12" cy="18" r="1" />
    </svg>
  )
}

function B2BIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M8 10v4M12 10v4M16 10v4" />
    </svg>
  )
}

function MarketplaceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function SyncIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  )
}

// ─── Source Badge ─────────────────────────────────────────────────────────────
function SourceBadge({ source }: { source: OrderSource }) {
  const cfg: Record<OrderSource, { bg: string; color: string; icon: React.ReactNode }> = {
    Website: { bg: 'rgba(20,184,166,0.15)', color: '#2dd4bf', icon: <WebsiteIcon /> },
    'Mobile App': { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', icon: <MobileIcon /> },
    'B2B Portal': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', icon: <B2BIcon /> },
    Marketplace: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', icon: <MarketplaceIcon /> },
  }
  const c = cfg[source]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: c.bg, color: c.color }}>
      {c.icon} {source}
    </span>
  )
}

// ─── Status Chip ─────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    New: 'bg-blue-500/15 text-blue-400',
    Processing: 'bg-indigo-500/15 text-indigo-400',
    Picked: 'bg-amber-500/15 text-amber-400',
    Shipped: 'bg-teal-500/15 text-teal-400',
    Delivered: 'bg-emerald-500/15 text-emerald-400',
    Cancelled: 'bg-red-500/15 text-red-400',
    Refunded: 'bg-zinc-700/60 text-zinc-400',
  }
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${map[status]}`}>{status}</span>
}

// ─── Order Data ───────────────────────────────────────────────────────────────
const ORDERS: Order[] = [
  { id: 'o1', orderNum: 'ONL-2026-8421', source: 'Website', customer: 'Sarah Martinez', itemCount: 2, total: 124.48, payment: 'Visa ****4821', shipMethod: 'UPS Ground', status: 'Processing', placedAt: 'Apr 22 10:42 AM', address: { line1: '1234 Oak Ave', city: 'Chicago', state: 'IL', zip: '60601' }, billing: { line1: '1234 Oak Ave', city: 'Chicago', state: 'IL', zip: '60601' }, lines: [{ sku: 'WGT-A100', name: 'Widget A100', qty: 1, price: 89.99 }, { sku: 'CBL-USB-1', name: 'USB-C Cable 2m', qty: 1, price: 34.49 }], tracking: undefined, warehouse: 'Chicago DC', pickStatus: 'Picking In Progress', authCode: 'AUTH-48291', paymentStatus: 'Authorized', timeline: ['Apr 22 10:42 AM — Order Placed', 'Apr 22 10:43 AM — Payment Authorized', 'Apr 22 10:50 AM — Picking Started'] },
  { id: 'o2', orderNum: 'ONL-2026-8420', source: 'Mobile App', customer: 'James Chen', itemCount: 1, total: 34.99, payment: 'Apple Pay', shipMethod: 'USPS', status: 'Shipped', placedAt: 'Apr 22 9:15 AM', address: { line1: '88 Pine St Apt 4B', city: 'New York', state: 'NY', zip: '10001' }, billing: { line1: '88 Pine St Apt 4B', city: 'New York', state: 'NY', zip: '10001' }, lines: [{ sku: 'MOU-WL', name: 'Wireless Mouse Pro', qty: 1, price: 34.99 }], tracking: '9400111899223841234567', warehouse: 'NY DC', pickStatus: 'Picked', authCode: 'AUTH-48290', paymentStatus: 'Captured', timeline: ['Apr 22 9:15 AM — Order Placed', 'Apr 22 9:16 AM — Payment Authorized', 'Apr 22 9:30 AM — Picking Started', 'Apr 22 10:15 AM — Shipped'] },
  { id: 'o3', orderNum: 'ONL-2026-8419', source: 'Website', customer: 'Lisa Park', itemCount: 3, total: 287.50, payment: 'Mastercard ****2341', shipMethod: 'FedEx', status: 'New', placedAt: 'Apr 22 8:30 AM', address: { line1: '555 Wilshire Blvd', city: 'Los Angeles', state: 'CA', zip: '90001' }, billing: { line1: '555 Wilshire Blvd', city: 'Los Angeles', state: 'CA', zip: '90001' }, lines: [{ sku: 'EAR-BT-X5', name: 'Bluetooth Earbuds X5', qty: 1, price: 149.99 }, { sku: 'HUB-7P', name: 'USB-C Hub 7-Port', qty: 1, price: 89.99 }, { sku: 'CBL-USB-3', name: 'USB-C Cable 3m', qty: 2, price: 47.52 }], tracking: undefined, warehouse: 'LA DC', pickStatus: 'Pending', authCode: 'AUTH-48289', paymentStatus: 'Authorized', timeline: ['Apr 22 8:30 AM — Order Placed', 'Apr 22 8:31 AM — Payment Authorized'] },
  { id: 'o4', orderNum: 'B2B-2026-0891', source: 'B2B Portal', customer: 'Michael Torres', company: 'Fabrikam Inc', itemCount: 50, total: 1749.50, payment: 'Net 30', shipMethod: 'LTL Freight', status: 'Processing', placedAt: 'Apr 21 3:00 PM', address: { line1: '100 Industrial Pkwy', city: 'Detroit', state: 'MI', zip: '48201' }, billing: { line1: '100 Industrial Pkwy', city: 'Detroit', state: 'MI', zip: '48201' }, lines: [{ sku: 'WGT-A100', name: 'Widget A100', qty: 50, price: 1749.50 }], tracking: undefined, warehouse: 'Chicago DC', pickStatus: 'Picking In Progress', authCode: 'NET30-0891', paymentStatus: 'Net 30', timeline: ['Apr 21 3:00 PM — Order Placed', 'Apr 21 3:05 PM — Credit Approved', 'Apr 21 4:00 PM — Picking Started'] },
  { id: 'o5', orderNum: 'MKT-2026-1241', source: 'Marketplace', customer: 'Robert Johnson', itemCount: 1, total: 49.99, payment: 'Marketplace Pay', shipMethod: 'Standard', status: 'Shipped', placedAt: 'Apr 21 11:20 AM', address: { line1: '42 Elm Street', city: 'Dallas', state: 'TX', zip: '75201' }, billing: { line1: '42 Elm Street', city: 'Dallas', state: 'TX', zip: '75201' }, lines: [{ sku: 'DRL-20P', name: 'Drill Bit Set 20pc', qty: 1, price: 49.99 }], tracking: '1Z999AA10123456784', warehouse: 'Dallas DC', pickStatus: 'Picked', authCode: 'MKT-48288', paymentStatus: 'Marketplace Pay', timeline: ['Apr 21 11:20 AM — Order Placed', 'Apr 21 11:21 AM — Payment Confirmed', 'Apr 21 12:00 PM — Picking Started', 'Apr 21 2:30 PM — Shipped'] },
  { id: 'o6', orderNum: 'ONL-2026-8418', source: 'Website', customer: 'Amanda Lewis', itemCount: 1, total: 89.99, payment: 'Visa ****1122', shipMethod: 'UPS Ground', status: 'Delivered', placedAt: 'Apr 20 9:00 AM', address: { line1: '789 Coral Way', city: 'Miami', state: 'FL', zip: '33101' }, billing: { line1: '789 Coral Way', city: 'Miami', state: 'FL', zip: '33101' }, lines: [{ sku: 'WGT-A100', name: 'Widget A100', qty: 1, price: 89.99 }], tracking: '1Z999BB10123456784', warehouse: 'Miami DC', pickStatus: 'Delivered', authCode: 'AUTH-48287', paymentStatus: 'Captured', timeline: ['Apr 20 9:00 AM — Order Placed', 'Apr 20 9:01 AM — Payment Authorized', 'Apr 20 10:00 AM — Picking Started', 'Apr 20 1:00 PM — Shipped', 'Apr 21 11:00 AM — Delivered'] },
  { id: 'o7', orderNum: 'ONL-2026-8417', source: 'Mobile App', customer: 'David Kim', itemCount: 2, total: 179.98, payment: 'Google Pay', shipMethod: 'FedEx', status: 'Picked', placedAt: 'Apr 22 7:45 AM', address: { line1: '321 Michigan Ave', city: 'Chicago', state: 'IL', zip: '60611' }, billing: { line1: '321 Michigan Ave', city: 'Chicago', state: 'IL', zip: '60611' }, lines: [{ sku: 'EAR-BT-X5', name: 'Bluetooth Earbuds X5', qty: 1, price: 149.99 }, { sku: 'CASE-BT', name: 'Earbuds Case', qty: 1, price: 29.99 }], tracking: undefined, warehouse: 'Chicago DC', pickStatus: 'Pick Complete', authCode: 'AUTH-48286', paymentStatus: 'Authorized', timeline: ['Apr 22 7:45 AM — Order Placed', 'Apr 22 7:46 AM — Payment Authorized', 'Apr 22 8:15 AM — Picking Started', 'Apr 22 9:45 AM — Pick Complete'] },
  { id: 'o8', orderNum: 'ONL-2026-8416', source: 'Website', customer: 'Jennifer Walsh', itemCount: 1, total: 34.99, payment: 'Visa ****3344', shipMethod: 'USPS', status: 'Cancelled', placedAt: 'Apr 21 6:00 PM', address: { line1: '100 Broadway', city: 'New York', state: 'NY', zip: '10005' }, billing: { line1: '100 Broadway', city: 'New York', state: 'NY', zip: '10005' }, lines: [{ sku: 'MOU-WL', name: 'Wireless Mouse Pro', qty: 1, price: 34.99 }], tracking: undefined, warehouse: '—', pickStatus: '—', authCode: 'AUTH-48285', paymentStatus: 'Authorized', timeline: ['Apr 21 6:00 PM — Order Placed', 'Apr 21 6:01 PM — Payment Authorized', 'Apr 21 7:30 PM — Cancelled by Customer'] },
  { id: 'o9', orderNum: 'B2B-2026-0890', source: 'B2B Portal', customer: 'Chris Wallace', company: 'Contoso Ltd', itemCount: 20, total: 4499.80, payment: 'Net 30', shipMethod: 'LTL Freight', status: 'Shipped', placedAt: 'Apr 19 10:00 AM', address: { line1: '5000 Commerce Dr', city: 'Houston', state: 'TX', zip: '77001' }, billing: { line1: '5000 Commerce Dr', city: 'Houston', state: 'TX', zip: '77001' }, lines: [{ sku: 'MTR-B200', name: 'Motor Housing B200', qty: 20, price: 4499.80 }], tracking: 'LTL-PRO-88234', warehouse: 'Dallas DC', pickStatus: 'Picked', authCode: 'NET30-0890', paymentStatus: 'Net 30', timeline: ['Apr 19 10:00 AM — Order Placed', 'Apr 19 10:10 AM — Credit Approved', 'Apr 20 8:00 AM — Picking Started', 'Apr 20 3:00 PM — Shipped'] },
  { id: 'o10', orderNum: 'MKT-2026-1240', source: 'Marketplace', customer: 'Patricia Nguyen', itemCount: 1, total: 149.99, payment: 'Marketplace Pay', shipMethod: 'FedEx', status: 'Delivered', placedAt: 'Apr 19 2:00 PM', address: { line1: '200 Sunset Blvd', city: 'Los Angeles', state: 'CA', zip: '90028' }, billing: { line1: '200 Sunset Blvd', city: 'Los Angeles', state: 'CA', zip: '90028' }, lines: [{ sku: 'EAR-BT-X5', name: 'Bluetooth Earbuds X5', qty: 1, price: 149.99 }], tracking: 'FX-748291003', warehouse: 'LA DC', pickStatus: 'Delivered', authCode: 'MKT-48284', paymentStatus: 'Marketplace Pay', timeline: ['Apr 19 2:00 PM — Order Placed', 'Apr 19 2:01 PM — Payment Confirmed', 'Apr 19 3:00 PM — Picking Started', 'Apr 19 5:00 PM — Shipped', 'Apr 20 10:00 AM — Delivered'] },
  { id: 'o11', orderNum: 'ONL-2026-8415', source: 'Website', customer: 'Thomas Brown', itemCount: 4, total: 312.45, payment: 'Amex ****5678', shipMethod: 'FedEx', status: 'Processing', placedAt: 'Apr 22 11:00 AM', address: { line1: '700 N Michigan', city: 'Chicago', state: 'IL', zip: '60611' }, billing: { line1: '700 N Michigan', city: 'Chicago', state: 'IL', zip: '60611' }, lines: [{ sku: 'HUB-7P', name: 'USB-C Hub 7-Port', qty: 2, price: 179.98 }, { sku: 'CBL-USB-1', name: 'USB-C Cable 2m', qty: 2, price: 132.47 }], tracking: undefined, warehouse: 'Chicago DC', pickStatus: 'Pending', authCode: 'AUTH-48283', paymentStatus: 'Authorized', timeline: ['Apr 22 11:00 AM — Order Placed', 'Apr 22 11:01 AM — Payment Authorized'] },
  { id: 'o12', orderNum: 'ONL-2026-8414', source: 'Mobile App', customer: 'Emily Davis', itemCount: 1, total: 59.99, payment: 'PayPal', shipMethod: 'UPS Ground', status: 'Refunded', placedAt: 'Apr 18 9:30 AM', address: { line1: '400 Park Ave', city: 'New York', state: 'NY', zip: '10022' }, billing: { line1: '400 Park Ave', city: 'New York', state: 'NY', zip: '10022' }, lines: [{ sku: 'DRL-20P', name: 'Drill Bit Set 20pc', qty: 1, price: 59.99 }], tracking: '1Z999CC10123456784', warehouse: 'NY DC', pickStatus: 'Returned', authCode: 'AUTH-48282', paymentStatus: 'Captured', timeline: ['Apr 18 9:30 AM — Order Placed', 'Apr 18 9:31 AM — Payment Authorized', 'Apr 18 11:00 AM — Shipped', 'Apr 19 2:00 PM — Delivered', 'Apr 20 10:00 AM — Return Requested', 'Apr 21 9:00 AM — Refunded'] },
  { id: 'o13', orderNum: 'ONL-2026-8413', source: 'Website', customer: 'Kevin Moore', itemCount: 2, total: 224.97, payment: 'Visa ****9900', shipMethod: 'FedEx', status: 'Shipped', placedAt: 'Apr 21 4:00 PM', address: { line1: '1800 Peachtree St', city: 'Atlanta', state: 'GA', zip: '30309' }, billing: { line1: '1800 Peachtree St', city: 'Atlanta', state: 'GA', zip: '30309' }, lines: [{ sku: 'WGT-A100', name: 'Widget A100', qty: 1, price: 89.99 }, { sku: 'EAR-BT-X5', name: 'Bluetooth Earbuds X5', qty: 1, price: 134.98 }], tracking: 'FX-748291099', warehouse: 'Atlanta DC', pickStatus: 'Picked', authCode: 'AUTH-48281', paymentStatus: 'Captured', timeline: ['Apr 21 4:00 PM — Order Placed', 'Apr 21 4:01 PM — Payment Authorized', 'Apr 21 5:00 PM — Picking Started', 'Apr 21 7:00 PM — Shipped'] },
  { id: 'o14', orderNum: 'MKT-2026-1239', source: 'Marketplace', customer: 'Susan Clark', itemCount: 1, total: 34.99, payment: 'Marketplace Pay', shipMethod: 'Standard', status: 'New', placedAt: 'Apr 22 10:55 AM', address: { line1: '900 S Wabash', city: 'Chicago', state: 'IL', zip: '60605' }, billing: { line1: '900 S Wabash', city: 'Chicago', state: 'IL', zip: '60605' }, lines: [{ sku: 'MOU-WL', name: 'Wireless Mouse Pro', qty: 1, price: 34.99 }], tracking: undefined, warehouse: 'Chicago DC', pickStatus: 'Pending', authCode: 'MKT-48280', paymentStatus: 'Marketplace Pay', timeline: ['Apr 22 10:55 AM — Order Placed', 'Apr 22 10:55 AM — Payment Confirmed'] },
  { id: 'o15', orderNum: 'B2B-2026-0889', source: 'B2B Portal', customer: 'Paul Anderson', company: 'Adventure Works', itemCount: 30, total: 8997.00, payment: 'Net 30', shipMethod: 'LTL Freight', status: 'Delivered', placedAt: 'Apr 15 10:00 AM', address: { line1: '2000 Industrial Blvd', city: 'Phoenix', state: 'AZ', zip: '85001' }, billing: { line1: '2000 Industrial Blvd', city: 'Phoenix', state: 'AZ', zip: '85001' }, lines: [{ sku: 'MTR-B200', name: 'Motor Housing B200', qty: 30, price: 8997.00 }], tracking: 'LTL-PRO-77119', warehouse: 'Phoenix DC', pickStatus: 'Delivered', authCode: 'NET30-0889', paymentStatus: 'Net 30', timeline: ['Apr 15 10:00 AM — Order Placed', 'Apr 15 10:10 AM — Credit Approved', 'Apr 16 8:00 AM — Shipped', 'Apr 18 11:00 AM — Delivered'] },
  { id: 'o16', orderNum: 'ONL-2026-8412', source: 'Website', customer: 'Nancy Wilson', itemCount: 1, total: 149.99, payment: 'Mastercard ****7788', shipMethod: 'UPS Ground', status: 'Processing', placedAt: 'Apr 22 9:00 AM', address: { line1: '50 Freedom Trail', city: 'Boston', state: 'MA', zip: '02101' }, billing: { line1: '50 Freedom Trail', city: 'Boston', state: 'MA', zip: '02101' }, lines: [{ sku: 'EAR-BT-X5', name: 'Bluetooth Earbuds X5', qty: 1, price: 149.99 }], tracking: undefined, warehouse: 'Boston DC', pickStatus: 'Picking In Progress', authCode: 'AUTH-48279', paymentStatus: 'Authorized', timeline: ['Apr 22 9:00 AM — Order Placed', 'Apr 22 9:01 AM — Payment Authorized', 'Apr 22 9:30 AM — Picking Started'] },
  { id: 'o17', orderNum: 'ONL-2026-8411', source: 'Mobile App', customer: 'Gary Thompson', itemCount: 3, total: 267.97, payment: 'Apple Pay', shipMethod: 'FedEx', status: 'Shipped', placedAt: 'Apr 21 2:00 PM', address: { line1: '1600 Vine St', city: 'Los Angeles', state: 'CA', zip: '90028' }, billing: { line1: '1600 Vine St', city: 'Los Angeles', state: 'CA', zip: '90028' }, lines: [{ sku: 'HUB-7P', name: 'USB-C Hub 7-Port', qty: 1, price: 89.99 }, { sku: 'WGT-A100', name: 'Widget A100', qty: 2, price: 177.98 }], tracking: 'FX-748291110', warehouse: 'LA DC', pickStatus: 'Picked', authCode: 'AUTH-48278', paymentStatus: 'Captured', timeline: ['Apr 21 2:00 PM — Order Placed', 'Apr 21 2:01 PM — Payment Authorized', 'Apr 21 3:00 PM — Picking Started', 'Apr 21 5:30 PM — Shipped'] },
  { id: 'o18', orderNum: 'MKT-2026-1238', source: 'Marketplace', customer: 'Diana Prince', itemCount: 2, total: 89.98, payment: 'Marketplace Pay', shipMethod: 'Standard', status: 'Delivered', placedAt: 'Apr 18 8:00 AM', address: { line1: '222 Coral Gables', city: 'Miami', state: 'FL', zip: '33134' }, billing: { line1: '222 Coral Gables', city: 'Miami', state: 'FL', zip: '33134' }, lines: [{ sku: 'MOU-WL', name: 'Wireless Mouse Pro', qty: 2, price: 89.98 }], tracking: 'USPS-9400112345', warehouse: 'Miami DC', pickStatus: 'Delivered', authCode: 'MKT-48277', paymentStatus: 'Marketplace Pay', timeline: ['Apr 18 8:00 AM — Order Placed', 'Apr 18 8:01 AM — Payment Confirmed', 'Apr 18 10:00 AM — Shipped', 'Apr 19 3:00 PM — Delivered'] },
  { id: 'o19', orderNum: 'ONL-2026-8410', source: 'Website', customer: 'Frank Miller', itemCount: 1, total: 74.99, payment: 'Visa ****4455', shipMethod: 'USPS', status: 'New', placedAt: 'Apr 22 11:10 AM', address: { line1: '333 Lakeshore Dr', city: 'Chicago', state: 'IL', zip: '60601' }, billing: { line1: '333 Lakeshore Dr', city: 'Chicago', state: 'IL', zip: '60601' }, lines: [{ sku: 'CBL-USB-1', name: 'USB-C Hub 7-Port Mini', qty: 1, price: 74.99 }], tracking: undefined, warehouse: 'Chicago DC', pickStatus: 'Pending', authCode: 'AUTH-48276', paymentStatus: 'Authorized', timeline: ['Apr 22 11:10 AM — Order Placed', 'Apr 22 11:11 AM — Payment Authorized'] },
  { id: 'o20', orderNum: 'B2B-2026-0888', source: 'B2B Portal', customer: 'Helen Carter', company: 'Northwind Traders', itemCount: 100, total: 24999.00, payment: 'Net 30', shipMethod: 'LTL Freight', status: 'Shipped', placedAt: 'Apr 20 9:00 AM', address: { line1: '4500 Commerce Pkwy', city: 'Dallas', state: 'TX', zip: '75240' }, billing: { line1: '4500 Commerce Pkwy', city: 'Dallas', state: 'TX', zip: '75240' }, lines: [{ sku: 'WGT-A100', name: 'Widget A100', qty: 100, price: 24999.00 }], tracking: 'LTL-PRO-66008', warehouse: 'Dallas DC', pickStatus: 'Picked', authCode: 'NET30-0888', paymentStatus: 'Net 30', timeline: ['Apr 20 9:00 AM — Order Placed', 'Apr 20 9:15 AM — Credit Approved', 'Apr 20 2:00 PM — Picking Started', 'Apr 21 8:00 AM — Shipped'] },
]

// ─── Order Detail Drawer ──────────────────────────────────────────────────────
function OrderDrawer({ order, onClose, onToast }: { order: Order; onClose: () => void; onToast: (m: string) => void }) {
  const fmt = (n: number) => '$' + n.toFixed(2)
  const subtotal = order.lines.reduce((s, l) => s + l.price, 0)
  const shipping = 8.99
  const tax = parseFloat((subtotal * 0.0875).toFixed(2))
  const total = subtotal + shipping + tax

  return (
    <div className="fixed inset-0 z-40 flex justify-end" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div
        className="h-full overflow-y-auto flex flex-col"
        style={{ width: '520px', background: '#0d0e24', borderLeft: '1px solid rgba(99,102,241,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b" style={{ background: '#0d0e24', borderColor: 'rgba(99,102,241,0.15)' }}>
          <div className="flex items-center gap-3">
            <SourceBadge source={order.source} />
            <span className="font-mono text-sm font-bold text-[#e2e8f0]">{order.orderNum}</span>
          </div>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#e2e8f0] transition-colors"><XIcon /></button>
        </div>

        <div className="flex-1 p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-[#e2e8f0]">{order.customer}</p>
              {order.company && <p className="text-xs text-[#94a3b8]">{order.company}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs text-[#94a3b8]">Placed</p>
              <p className="text-xs font-medium text-[#e2e8f0]">{order.placedAt}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {([{ label: 'Ship To', addr: order.address }, { label: 'Bill To', addr: order.billing }] as const).map(({ label, addr }) => (
              <div key={label} className="rounded-lg border p-3" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8] mb-2">{label}</p>
                <p className="text-xs text-[#e2e8f0]">{addr.line1}</p>
                <p className="text-xs text-[#94a3b8]">{addr.city}, {addr.state} {addr.zip}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8] mb-3">Order Lines</p>
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.06)' }}>
                    {['Item', 'SKU', 'Qty', 'Unit Price', 'Subtotal'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.lines.map((line, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: 'rgba(99,102,241,0.08)' }}>
                      <td className="px-3 py-2.5 text-[#e2e8f0]">{line.name}</td>
                      <td className="px-3 py-2.5 font-mono text-[#94a3b8]">{line.sku}</td>
                      <td className="px-3 py-2.5 text-[#94a3b8]">{line.qty}</td>
                      <td className="px-3 py-2.5 text-[#94a3b8]">{fmt(line.price / line.qty)}</td>
                      <td className="px-3 py-2.5 font-medium text-[#e2e8f0]">{fmt(line.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border p-4 space-y-1.5" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8] mb-3">Order Totals</p>
            {[{ label: 'Subtotal', value: fmt(subtotal) }, { label: 'Shipping', value: fmt(shipping) }, { label: 'Tax (8.75%)', value: fmt(tax) }, { label: 'Discount', value: '—' }].map(r => (
              <div key={r.label} className="flex justify-between text-xs">
                <span className="text-[#94a3b8]">{r.label}</span>
                <span className="text-[#e2e8f0]">{r.value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2" style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
              <span className="text-[#e2e8f0]">Total</span>
              <span className="text-indigo-400">{fmt(total)}</span>
            </div>
          </div>

          <div className="rounded-xl border p-4" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8] mb-3">Payment</p>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <span className="text-[#94a3b8]">Method</span><span className="text-[#e2e8f0]">{order.payment}</span>
              <span className="text-[#94a3b8]">Auth Code</span><span className="font-mono text-[#e2e8f0]">{order.authCode}</span>
              <span className="text-[#94a3b8]">Status</span><span className="text-emerald-400 font-medium">{order.paymentStatus}</span>
            </div>
          </div>

          <div className="rounded-xl border p-4" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8] mb-3">Fulfillment</p>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <span className="text-[#94a3b8]">Warehouse</span><span className="text-[#e2e8f0]">{order.warehouse}</span>
              <span className="text-[#94a3b8]">Pick Status</span><span className="text-[#e2e8f0]">{order.pickStatus}</span>
              <span className="text-[#94a3b8]">Carrier</span><span className="text-[#e2e8f0]">{order.shipMethod}</span>
              <span className="text-[#94a3b8]">Tracking</span><span className="font-mono text-indigo-400 text-[10px] break-all">{order.tracking ?? '—'}</span>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8] mb-3">Timeline</p>
            <div className="relative pl-4 space-y-3">
              {order.timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  <span className="absolute left-[-10px] top-1.5 h-2 w-2 rounded-full border-2 border-indigo-500 bg-[#0d0e24]" />
                  {i < order.timeline.length - 1 && (
                    <span className="absolute left-[-7px] top-3.5 h-full w-px bg-[rgba(99,102,241,0.2)]" />
                  )}
                  <p className="text-xs text-[#94a3b8]">{event}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
            {[{ label: 'Ship', primary: true }, { label: 'Cancel' }, { label: 'Refund' }, { label: 'View Customer' }, { label: 'Print Packing Slip' }].map(btn => (
              <button key={btn.label} onClick={() => onToast(`${btn.label}: ${order.orderNum}`)} className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors" style={{ background: btn.primary ? '#6366f1' : 'transparent', color: btn.primary ? '#fff' : '#94a3b8', border: btn.primary ? 'none' : '1px solid rgba(99,102,241,0.2)' }}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EcommerceOrdersPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  function toggleRow(id: string) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  const kpis = [
    { label: 'Online Orders Today', value: '47', color: '#e2e8f0' },
    { label: 'Pending Fulfillment', value: '23', color: '#f59e0b' },
    { label: 'Shipped Today', value: '18', color: '#10b981' },
    { label: 'Revenue Today', value: '$4,821', color: '#e2e8f0' },
    { label: 'Avg Order Value', value: '$102.57', color: '#e2e8f0' },
  ]

  const SOURCES = ['All', 'Website', 'Mobile App', 'B2B Portal', 'Marketplace']
  const STATUSES = ['All', 'New', 'Processing', 'Picked', 'Shipped', 'Delivered', 'Cancelled', 'Refunded']

  const filtered = ORDERS.filter(o => {
    const matchSrc = sourceFilter === 'All' || o.source === sourceFilter
    const matchSt = statusFilter === 'All' || o.status === statusFilter
    const matchSearch = search === '' || o.orderNum.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase())
    return matchSrc && matchSt && matchSearch
  })

  const actions = (
    <>
      <button onClick={() => showToast('Sync initiated…')} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">
        <SyncIcon /> Sync Now
      </button>
      <button onClick={() => showToast('Manual order creation')} className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(99,102,241,0.3)] px-3 py-1.5 text-xs font-medium text-[#e2e8f0] hover:bg-[#16213e] transition-colors">
        Create Manual Order
      </button>
      <button onClick={() => showToast(`Bulk shipping ${selected.length} orders…`)} className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(99,102,241,0.3)] px-3 py-1.5 text-xs font-medium text-[#e2e8f0] hover:bg-[#16213e] transition-colors">
        Bulk Ship
      </button>
      <button onClick={() => showToast('Exporting orders…')} className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(99,102,241,0.3)] px-3 py-1.5 text-xs font-medium text-[#e2e8f0] hover:bg-[#16213e] transition-colors">
        Export
      </button>
    </>
  )

  if (!mounted) return null

  return (
    <>
      <TopBar
        title="eCommerce Orders"
        breadcrumb={[{ label: 'eCommerce', href: '/ecommerce' }]}
        actions={actions}
      />

      {selectedOrder && (
        <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} onToast={showToast} />
      )}

      {toast && (
        <div className="fixed top-16 right-6 z-50 rounded-lg border border-[rgba(99,102,241,0.3)] bg-[#16213e] px-4 py-2.5 text-xs text-[#e2e8f0] shadow-xl">
          {toast}
        </div>
      )}

      <main className="flex-1 overflow-auto p-6 space-y-6" style={{ background: '#0d0e24', minHeight: '100dvh' }}>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map(k => (
            <div key={k.label} className="rounded-xl border p-4" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8] mb-2">{k.label}</p>
              <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <input type="text" placeholder="Order # or customer…" value={search} onChange={e => setSearch(e.target.value)} className="rounded-lg border px-3 py-2 text-xs text-[#e2e8f0] placeholder:text-zinc-600 outline-none focus:border-indigo-500 transition-colors" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.2)', width: '200px' }} />
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-xs text-[#e2e8f0] outline-none focus:border-indigo-500 transition-colors" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.2)' }}>
            {SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-xs text-[#e2e8f0] outline-none focus:border-indigo-500 transition-colors" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.2)' }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <span className="text-xs text-[#94a3b8] ml-auto">{filtered.length} orders</span>
        </div>

        {/* Orders Table */}
        <div className="rounded-xl border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'rgba(99,102,241,0.06)' }}>
                  <th className="w-10 px-4 py-3"></th>
                  {['Order #', 'Source', 'Customer', 'Items', 'Order Total', 'Payment', 'Ship Method', 'Status', 'Placed At'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold uppercase tracking-wider text-[#94a3b8] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id} onClick={() => setSelectedOrder(order)} className="border-t cursor-pointer transition-colors hover:bg-[rgba(99,102,241,0.06)]" style={{ borderColor: 'rgba(99,102,241,0.08)', background: selected.includes(order.id) ? 'rgba(99,102,241,0.08)' : 'transparent' }}>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.includes(order.id)} onChange={() => toggleRow(order.id)} className="accent-indigo-500 w-3 h-3" />
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-indigo-400 whitespace-nowrap">{order.orderNum}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><SourceBadge source={order.source} /></td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-[#e2e8f0]">{order.customer}</div>
                      {order.company && <div className="text-[10px] text-[#94a3b8]">{order.company}</div>}
                    </td>
                    <td className="px-4 py-3 text-[#94a3b8] whitespace-nowrap">{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</td>
                    <td className="px-4 py-3 font-semibold text-[#e2e8f0] whitespace-nowrap">${order.total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-[#94a3b8] whitespace-nowrap">{order.payment}</td>
                    <td className="px-4 py-3 text-[#94a3b8] whitespace-nowrap">{order.shipMethod}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusChip status={order.status} /></td>
                    <td className="px-4 py-3 text-[#94a3b8] whitespace-nowrap">{order.placedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sync Status Footer */}
        <div className="flex items-center justify-between rounded-xl border px-5 py-3" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
          <div className="flex items-center gap-4 text-xs text-[#94a3b8]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
              Last synced with Online Store: <strong className="text-[#e2e8f0]">14 min ago</strong>
            </span>
            <span className="text-emerald-400">0 errors</span>
          </div>
          <button onClick={() => showToast('Sync initiated…')} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">
            <SyncIcon /> Sync Now
          </button>
        </div>

      </main>
    </>
  )
}
