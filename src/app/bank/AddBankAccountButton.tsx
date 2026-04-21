'use client'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function AddBankAccountButton() {
  return (
    <Button
      size="sm"
      onClick={() => alert('Add Bank Account — form coming soon')}
    >
      <Plus className="w-4 h-4 mr-1" />
      Add Bank Account
    </Button>
  )
}
