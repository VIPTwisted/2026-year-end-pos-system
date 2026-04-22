'use client'
import { createContext, useContext, useReducer, ReactNode } from 'react'

export interface CartLine {
  id: string
  productId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  originalPrice: number
  discount: number
  taxable: boolean
  taxAmount: number
  lineTotal: number
  serialNumber?: string
}

export interface PaymentLine {
  method: string
  amount: number
  reference?: string
}

export interface POSState {
  cartLines: CartLine[]
  customerId: string | null
  customerName: string | null
  loyaltyCardNumber: string | null
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalDiscount: number
  total: number
  paymentLines: PaymentLine[]
  shiftId: string | null
  operatorId: string | null
  transactionComment: string | null
  isSuspended: boolean
  selectedLineId: string | null
  transactionId: string
}

type POSAction =
  | { type: 'ADD_LINE'; payload: CartLine }
  | { type: 'REMOVE_LINE'; lineId: string }
  | { type: 'UPDATE_QUANTITY'; lineId: string; quantity: number }
  | { type: 'APPLY_LINE_DISCOUNT'; lineId: string; discountPct: number }
  | { type: 'PRICE_OVERRIDE'; lineId: string; newPrice: number }
  | { type: 'SET_TOTAL_DISCOUNT'; discountPct: number }
  | { type: 'CLEAR_TOTAL_DISCOUNT' }
  | { type: 'SET_CUSTOMER'; customerId: string; customerName: string }
  | { type: 'CLEAR_CUSTOMER' }
  | { type: 'ADD_PAYMENT'; method: string; amount: number; reference?: string }
  | { type: 'CLEAR_PAYMENTS' }
  | { type: 'VOID_TRANSACTION' }
  | { type: 'SET_COMMENT'; comment: string }
  | { type: 'SET_SELECTED_LINE'; lineId: string | null }
  | { type: 'SET_SUSPENDED'; value: boolean }
  | { type: 'RESTORE_TRANSACTION'; state: Partial<POSState> }
  | { type: 'RECALCULATE' }
  | { type: 'SET_SERIAL'; lineId: string; serialNumber: string }

const TAX_RATE = 0.0825

function calcLine(line: CartLine): CartLine {
  const discountedPrice = line.originalPrice * (1 - line.discount / 100)
  const actualUnitPrice = line.discount > 0 ? discountedPrice : line.unitPrice
  const baseTotal = actualUnitPrice * line.quantity
  const taxAmount = line.taxable ? baseTotal * TAX_RATE : 0
  const lineTotal = baseTotal
  return { ...line, unitPrice: actualUnitPrice, taxAmount, lineTotal }
}

function recalcTotals(lines: CartLine[], totalDiscount: number): Pick<POSState, 'subtotal' | 'taxAmount' | 'discountAmount' | 'total'> {
  const subtotal = lines.reduce((s, l) => s + l.originalPrice * l.quantity, 0)
  const lineDiscountAmount = lines.reduce((s, l) => {
    const base = l.originalPrice * l.quantity
    const discounted = l.unitPrice * l.quantity
    return s + (base - discounted)
  }, 0)
  const subtotalAfterLineDiscounts = subtotal - lineDiscountAmount
  const totalDiscountAmount = totalDiscount > 0 ? subtotalAfterLineDiscounts * (totalDiscount / 100) : 0
  const discountAmount = lineDiscountAmount + totalDiscountAmount
  const taxBase = subtotalAfterLineDiscounts - totalDiscountAmount
  const taxAmount = lines.reduce((s, l) => {
    if (!l.taxable) return s
    const lineProportion = l.originalPrice > 0 ? (l.unitPrice * l.quantity) / subtotalAfterLineDiscounts : 0
    const lineTaxBase = taxBase * lineProportion
    return s + lineTaxBase * TAX_RATE
  }, 0)
  const total = taxBase + taxAmount
  return { subtotal, taxAmount, discountAmount, total }
}

function posReducer(state: POSState, action: POSAction): POSState {
  switch (action.type) {
    case 'ADD_LINE': {
      const existing = state.cartLines.find(l => l.productId === action.payload.productId && l.discount === 0)
      let lines: CartLine[]
      if (existing) {
        lines = state.cartLines.map(l =>
          l.id === existing.id
            ? calcLine({ ...l, quantity: l.quantity + action.payload.quantity })
            : l
        )
      } else {
        lines = [...state.cartLines, calcLine(action.payload)]
      }
      return { ...state, cartLines: lines, ...recalcTotals(lines, state.totalDiscount) }
    }

    case 'REMOVE_LINE': {
      const lines = state.cartLines.filter(l => l.id !== action.lineId)
      const selectedLineId = state.selectedLineId === action.lineId ? null : state.selectedLineId
      return { ...state, cartLines: lines, selectedLineId, ...recalcTotals(lines, state.totalDiscount) }
    }

    case 'UPDATE_QUANTITY': {
      const lines = action.quantity <= 0
        ? state.cartLines.filter(l => l.id !== action.lineId)
        : state.cartLines.map(l =>
            l.id === action.lineId ? calcLine({ ...l, quantity: action.quantity }) : l
          )
      return { ...state, cartLines: lines, ...recalcTotals(lines, state.totalDiscount) }
    }

    case 'APPLY_LINE_DISCOUNT': {
      const lines = state.cartLines.map(l => {
        if (l.id !== action.lineId) return l
        const discountedPrice = l.originalPrice * (1 - action.discountPct / 100)
        return calcLine({ ...l, discount: action.discountPct, unitPrice: discountedPrice })
      })
      return { ...state, cartLines: lines, ...recalcTotals(lines, state.totalDiscount) }
    }

    case 'PRICE_OVERRIDE': {
      const lines = state.cartLines.map(l => {
        if (l.id !== action.lineId) return l
        return calcLine({ ...l, unitPrice: action.newPrice, originalPrice: action.newPrice, discount: 0 })
      })
      return { ...state, cartLines: lines, ...recalcTotals(lines, state.totalDiscount) }
    }

    case 'SET_TOTAL_DISCOUNT': {
      const { subtotal, taxAmount, discountAmount, total } = recalcTotals(state.cartLines, action.discountPct)
      return { ...state, totalDiscount: action.discountPct, subtotal, taxAmount, discountAmount, total }
    }

    case 'CLEAR_TOTAL_DISCOUNT': {
      const { subtotal, taxAmount, discountAmount, total } = recalcTotals(state.cartLines, 0)
      return { ...state, totalDiscount: 0, subtotal, taxAmount, discountAmount, total }
    }

    case 'SET_CUSTOMER':
      return { ...state, customerId: action.customerId, customerName: action.customerName }

    case 'CLEAR_CUSTOMER':
      return { ...state, customerId: null, customerName: null, loyaltyCardNumber: null }

    case 'ADD_PAYMENT':
      return {
        ...state,
        paymentLines: [...state.paymentLines, { method: action.method, amount: action.amount, reference: action.reference }],
      }

    case 'CLEAR_PAYMENTS':
      return { ...state, paymentLines: [] }

    case 'VOID_TRANSACTION':
      return {
        ...initialState,
        shiftId: state.shiftId,
        operatorId: state.operatorId,
        transactionId: generateTxId(),
      }

    case 'SET_COMMENT':
      return { ...state, transactionComment: action.comment }

    case 'SET_SELECTED_LINE':
      return { ...state, selectedLineId: action.lineId }

    case 'SET_SUSPENDED':
      return { ...state, isSuspended: action.value }

    case 'RESTORE_TRANSACTION':
      return {
        ...state,
        ...action.state,
        isSuspended: false,
        transactionId: generateTxId(),
      }

    case 'RECALCULATE': {
      const recalculated = state.cartLines.map(calcLine)
      return { ...state, cartLines: recalculated, ...recalcTotals(recalculated, state.totalDiscount) }
    }

    case 'SET_SERIAL':
      return {
        ...state,
        cartLines: state.cartLines.map(l =>
          l.id === action.lineId ? { ...l, serialNumber: action.serialNumber } : l
        ),
      }

    default:
      return state
  }
}

function generateTxId(): string {
  return `TXN-${Date.now().toString(36).toUpperCase()}`
}

const initialState: POSState = {
  cartLines: [],
  customerId: null,
  customerName: null,
  loyaltyCardNumber: null,
  subtotal: 0,
  taxAmount: 0,
  discountAmount: 0,
  totalDiscount: 0,
  total: 0,
  paymentLines: [],
  shiftId: null,
  operatorId: null,
  transactionComment: null,
  isSuspended: false,
  selectedLineId: null,
  transactionId: generateTxId(),
}

interface POSContextValue {
  state: POSState
  dispatch: React.Dispatch<POSAction>
}

const POSContext = createContext<POSContextValue | null>(null)

export function POSProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(posReducer, initialState)
  return <POSContext.Provider value={{ state, dispatch }}>{children}</POSContext.Provider>
}

export function usePOS(): POSContextValue {
  const ctx = useContext(POSContext)
  if (!ctx) throw new Error('usePOS must be used inside <POSProvider>')
  return ctx
}

export { TAX_RATE }
