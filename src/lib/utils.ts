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
