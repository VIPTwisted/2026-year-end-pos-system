import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Store } from 'lucide-react'

export default function StoresPage() {
  return (
    <>
      <TopBar title="Stores / HQ" />
      <main className="flex-1 p-6 overflow-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Store className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-base font-medium text-zinc-300 mb-2">Stores / HQ</p>
            <p className="text-sm">Module under construction — coming next session</p>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
