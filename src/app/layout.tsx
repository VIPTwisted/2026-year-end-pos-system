import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { auth } from '@/auth'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NovaPOS — Enterprise Platform',
  description: 'NovaPOS — Full Enterprise ERP & Commerce Platform',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 flex`}>
        <SessionProvider session={session}>
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}
