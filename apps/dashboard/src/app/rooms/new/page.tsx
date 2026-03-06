'use client'
// Redirect /rooms/new → /rooms (create modal opens on the list page)
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RoomsNewRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/rooms?action=create') }, [router])
  return null
}
