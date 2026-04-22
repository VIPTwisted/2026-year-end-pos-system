'use client'

interface ReceiptPreviewProps {
  headerLine1: string
  headerLine2: string
  headerLine3: string
  footerLine1: string
  footerLine2: string
  footerLine3: string
  paperWidth: number
  fontSize: string
  showLogo: boolean
  logoUrl: string
  showStoreName: boolean
  showStoreAddress: boolean
  showStorePhone: boolean
  showCashier: boolean
  showOrderNumber: boolean
  showDateTime: boolean
  showBarcode: boolean
  showQrCode: boolean
  showTaxDetail: boolean
  showLoyaltyBalance: boolean
  showReturnPolicy: boolean
  returnPolicyText: string
}

const MOCK_DATE = 'Apr 21, 2026, 2:34 PM'
const MOCK_ORDER = 'ORD-00001234'
const MOCK_STORE_NAME = 'NovaPOS Main Store'
const MOCK_STORE_ADDRESS = '123 Commerce St, Suite 100'
const MOCK_STORE_CITY = 'Austin, TX 78701'
const MOCK_STORE_PHONE = '(512) 555-0191'
const MOCK_CASHIER = 'Alex M.'

const MOCK_ITEMS = [
  { name: 'Premium Wireless Earbuds', qty: 1, price: 89.99 },
  { name: 'USB-C Charging Cable 6ft', qty: 2, price: 12.99 },
  { name: 'Phone Case — Clear', qty: 1, price: 19.99 },
]

const MOCK_SUBTOTAL = MOCK_ITEMS.reduce((s, i) => s + i.qty * i.price, 0)
const MOCK_TAX_RATE = 0.0825
const MOCK_TAX = parseFloat((MOCK_SUBTOTAL * MOCK_TAX_RATE).toFixed(2))
const MOCK_TOTAL = parseFloat((MOCK_SUBTOTAL + MOCK_TAX).toFixed(2))
const MOCK_LOYALTY_BALANCE = 340

function fmt(n: number) {
  return `$${n.toFixed(2)}`
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  const cls = bold ? 'font-bold' : ''
  return (
    <div className={`flex justify-between gap-2 ${cls}`}>
      <span className="truncate">{label}</span>
      <span className="shrink-0">{value}</span>
    </div>
  )
}

function Divider({ dashed = true }: { dashed?: boolean }) {
  return (
    <div className="my-1.5 border-t border-dashed border-current opacity-40" style={{ borderStyle: dashed ? 'dashed' : 'solid' }} />
  )
}

function Centered({ children, bold }: { children: React.ReactNode; bold?: boolean }) {
  return (
    <div className={`text-center ${bold ? 'font-bold' : ''}`}>{children}</div>
  )
}

export function ReceiptPreview({
  headerLine1,
  headerLine2,
  headerLine3,
  footerLine1,
  footerLine2,
  footerLine3,
  paperWidth,
  fontSize,
  showLogo,
  logoUrl,
  showStoreName,
  showStoreAddress,
  showStorePhone,
  showCashier,
  showOrderNumber,
  showDateTime,
  showBarcode,
  showQrCode,
  showTaxDetail,
  showLoyaltyBalance,
  showReturnPolicy,
  returnPolicyText,
}: ReceiptPreviewProps) {
  // Map paper width to pixel equivalent for preview
  const previewWidth = paperWidth <= 58 ? 220 : 300

  const fontSizeCls =
    fontSize === 'small' ? 'text-[9px]' :
    fontSize === 'large' ? 'text-[13px]' :
    'text-[11px]'

  return (
    <div
      className={`font-mono bg-white text-zinc-900 shadow-xl rounded mx-auto ${fontSizeCls}`}
      style={{ width: previewWidth, padding: '16px 12px', lineHeight: 1.5 }}
    >
      {/* Logo */}
      {showLogo && logoUrl && (
        <div className="text-center mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt="Store Logo" className="h-10 mx-auto object-contain" />
        </div>
      )}
      {showLogo && !logoUrl && (
        <Centered>
          <div className="border border-dashed border-zinc-400 rounded px-3 py-1 text-[9px] text-zinc-400 inline-block mb-1">
            LOGO
          </div>
        </Centered>
      )}

      {/* Store info */}
      {showStoreName && <Centered bold>{MOCK_STORE_NAME}</Centered>}
      {showStoreAddress && (
        <>
          <Centered>{MOCK_STORE_ADDRESS}</Centered>
          <Centered>{MOCK_STORE_CITY}</Centered>
        </>
      )}
      {showStorePhone && <Centered>Tel: {MOCK_STORE_PHONE}</Centered>}

      {/* Custom header lines */}
      {(headerLine1 || headerLine2 || headerLine3) && (
        <>
          <Divider />
          {headerLine1 && <Centered>{headerLine1}</Centered>}
          {headerLine2 && <Centered>{headerLine2}</Centered>}
          {headerLine3 && <Centered>{headerLine3}</Centered>}
        </>
      )}

      <Divider />

      {/* Transaction info */}
      {showOrderNumber && <Row label="Order #" value={MOCK_ORDER} />}
      {showDateTime && <Row label="Date" value={MOCK_DATE} />}
      {showCashier && <Row label="Cashier" value={MOCK_CASHIER} />}

      <Divider />

      {/* Line items */}
      <div className="font-bold mb-1 uppercase opacity-60" style={{ letterSpacing: '0.05em' }}>Items</div>
      {MOCK_ITEMS.map((item, idx) => (
        <div key={idx} className="mb-1">
          <div>{item.name}</div>
          <div className="flex justify-between pl-2">
            <span>{item.qty} x {fmt(item.price)}</span>
            <span>{fmt(item.qty * item.price)}</span>
          </div>
        </div>
      ))}

      <Divider />

      {/* Totals */}
      <Row label="Subtotal" value={fmt(MOCK_SUBTOTAL)} />
      {showTaxDetail ? (
        <Row label={`Tax (${(MOCK_TAX_RATE * 100).toFixed(2)}%)`} value={fmt(MOCK_TAX)} />
      ) : (
        <Row label="Tax" value={fmt(MOCK_TAX)} />
      )}
      <Divider dashed={false} />
      <Row label="TOTAL" value={fmt(MOCK_TOTAL)} bold />
      <div className="mt-1">
        <Row label="VISA ****4242" value={fmt(MOCK_TOTAL)} />
        <Row label="Change Due" value={fmt(0)} />
      </div>

      {/* Loyalty */}
      {showLoyaltyBalance && (
        <>
          <Divider />
          <Row label="Loyalty Points Balance" value={`${MOCK_LOYALTY_BALANCE} pts`} />
          <Row label="Points Earned Today" value="+14 pts" />
        </>
      )}

      {/* Barcode */}
      {showBarcode && (
        <>
          <Divider />
          <div className="flex flex-col items-center gap-0.5 my-1">
            {/* Simulated barcode lines */}
            <div className="flex gap-px h-8">
              {Array.from({ length: 40 }, (_, i) => (
                <div
                  key={i}
                  className="bg-zinc-900"
                  style={{ width: i % 3 === 0 ? 3 : i % 5 === 0 ? 1 : 2, height: '100%' }}
                />
              ))}
            </div>
            <span className="text-[8px] tracking-widest opacity-60">{MOCK_ORDER}</span>
          </div>
        </>
      )}

      {/* QR Code */}
      {showQrCode && (
        <>
          <Divider />
          <div className="flex flex-col items-center my-1">
            <div
              className="border border-zinc-400 rounded"
              style={{ width: 50, height: 50, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, padding: 4 }}
            >
              {Array.from({ length: 49 }, (_, i) => (
                <div
                  key={i}
                  className={[0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,47,48].includes(i)
                    ? 'bg-zinc-900 rounded-sm'
                    : 'bg-white'}
                />
              ))}
            </div>
            <span className="text-[8px] opacity-50 mt-1">Scan to view receipt</span>
          </div>
        </>
      )}

      <Divider />

      {/* Footer lines */}
      {footerLine1 && <Centered>{footerLine1}</Centered>}
      {footerLine2 && <Centered>{footerLine2}</Centered>}
      {footerLine3 && <Centered>{footerLine3}</Centered>}

      {/* Return policy */}
      {showReturnPolicy && returnPolicyText && (
        <>
          <Divider />
          <div className="text-center opacity-70 text-[9px] leading-tight">{returnPolicyText}</div>
        </>
      )}
      {showReturnPolicy && !returnPolicyText && (
        <>
          <Divider />
          <div className="text-center opacity-70 text-[9px] leading-tight">
            Returns accepted within 30 days with receipt.
          </div>
        </>
      )}

      {/* Width label */}
      <div className="mt-3 text-center text-[8px] opacity-30">{paperWidth}mm paper</div>
    </div>
  )
}
