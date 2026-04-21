import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
}

export function generateOrderNumber() {
  return `ORD-${Date.now().toString(36).toUpperCase()}`
}

export function generatePONumber() {
  return `PO-${Date.now().toString(36).toUpperCase()}`
}

export function generateCaseNumber() {
  return `CS-${Date.now().toString(36).toUpperCase()}`
}

export function generateWONumber() {
  return `WO-${Date.now().toString(36).toUpperCase()}`
}

export function generateVendorCode(name: string) {
  return `V-${name.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`
}

export function generateInvoiceNumber(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`
}

export function generatePaymentNumber() {
  return `VPAY-${Date.now().toString(36).toUpperCase()}`
}

export function getDaysOverdue(dueDate: Date | string): number {
  const due = new Date(dueDate)
  const now = new Date()
  return Math.max(0, Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)))
}

export function isOverdue(dueDate: Date | string, status: string): boolean {
  if (['paid', 'cancelled'].includes(status)) return false
  return new Date(dueDate) < new Date()
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    draft: 'text-zinc-400',
    posted: 'text-blue-400',
    paid: 'text-emerald-400',
    partial: 'text-amber-400',
    cancelled: 'text-red-400',
    open: 'text-emerald-400',
    closed: 'text-zinc-500',
    on_hold: 'text-amber-400',
    pending: 'text-blue-400',
    reconciled: 'text-emerald-400',
  }
  return map[status] ?? 'text-zinc-400'
}
