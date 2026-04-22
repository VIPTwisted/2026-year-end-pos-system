'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Building2, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const inputCls =
    'w-full bg-[#0d1b2e] border border-blue-900/40 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors pl-9'

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #0d1b2e 50%, #1a1a2e 100%)' }}
    >
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-blue-900/40">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-zinc-100 tracking-tight">NovaPOS</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Enterprise Platform</p>
        </div>

        {/* Card */}
        <div className="bg-[#16213e] border border-blue-900/30 rounded-xl p-6 shadow-2xl shadow-blue-950/50">
          <h2 className="text-sm font-semibold text-zinc-100 mb-0.5">Sign in</h2>
          <p className="text-xs text-zinc-500 mb-5">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@store.local"
                className={inputCls}
                required
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-md transition-colors mt-1"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 pt-4 border-t border-blue-900/30">
            <p className="text-[11px] text-zinc-600 mb-2 font-medium uppercase tracking-wider">Demo credentials</p>
            <div className="space-y-1 text-[11px] text-zinc-600 font-mono">
              <div>admin@bc.local / Admin1234!</div>
              <div>manager@bc.local / Manager1234!</div>
              <div>cashier@bc.local / Cashier1234!</div>
              <div>accountant@bc.local / Account1234!</div>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-zinc-700 mt-6">
          NovaPOS Enterprise Platform
        </p>
      </div>
    </div>
  )
}
