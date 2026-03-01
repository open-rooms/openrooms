'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/home')
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-muted border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
        <div className="text-muted-foreground font-medium">Loading...</div>
      </div>
    </div>
  )
}
