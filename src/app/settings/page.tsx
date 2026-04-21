import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <>
      <TopBar title="Settings" />
      <main className="flex-1 p-6 overflow-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Settings className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-base font-medium text-zinc-300 mb-2">Settings</p>
            <p className="text-sm">Module under construction — coming next session</p>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
