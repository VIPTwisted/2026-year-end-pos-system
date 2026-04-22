'use client'
import { useEffect, useRef, useState } from 'react'
import { Bell, AlertTriangle, Info, XCircle, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { AppNotification } from '@/app/api/notifications/route'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const fetchNotifications = () => {
    fetch('/api/notifications')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { notifications: AppNotification[]; unreadCount: number }) => {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      })
      .catch(() => {
        // fail silently — don't break the topbar
      })
      .finally(() => setLoading(false))
  }

  // Initial fetch + 60s polling
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60_000)
    return () => clearInterval(interval)
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleNotificationClick = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  const borderColor = (type: AppNotification['type']) => {
    if (type === 'warning') return 'border-l-amber-500'
    if (type === 'error') return 'border-l-red-500'
    return 'border-l-blue-500'
  }

  const iconForType = (type: AppNotification['type']) => {
    if (type === 'warning')
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
    if (type === 'error')
      return <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
    return <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-7 h-7 rounded hover:bg-zinc-800/60 text-zinc-500 hover:text-zinc-300 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-3.5 h-3.5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-[9px] font-bold text-white leading-none px-0.5">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-80 bg-[#16213e] border border-zinc-800/60 rounded-lg shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/60">
            <span className="text-[12px] font-semibold text-zinc-200 uppercase tracking-wide">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="text-[10px] text-zinc-500">
                {unreadCount} alert{unreadCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[320px] overflow-y-auto divide-y divide-zinc-800/40">
            {loading ? (
              <div className="px-4 py-6 text-center text-zinc-500 text-[12px]">
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 flex flex-col items-center gap-2 text-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-[12px] text-zinc-400">
                  All clear — no alerts
                </span>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n.href)}
                  className={`w-full text-left flex gap-2.5 px-3 py-2.5 border-l-2 ${borderColor(n.type)} hover:bg-zinc-800/40 transition-colors`}
                >
                  {iconForType(n.type)}
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-zinc-100 leading-snug">
                      {n.title}
                    </p>
                    <p className="text-[11px] text-zinc-400 leading-snug mt-0.5">
                      {n.message}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-800/60 px-4 py-2">
            <button
              onClick={() => handleNotificationClick('/notifications')}
              className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
