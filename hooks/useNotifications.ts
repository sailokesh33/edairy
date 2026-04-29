import { useState, useEffect } from 'react'
import { requestNotificationPermission } from '@/lib/firebase-client'
import { getMedications } from '@/lib/storage'

export function useNotifications() {
  const [status, setStatus] = useState<'idle' | 'granted' | 'denied' | 'loading'>('idle')

  useEffect(() => {
    if (typeof window !== 'undefined' && Notification.permission === 'granted') {
      setStatus('granted')
    }
  }, [])

  const subscribe = async () => {
    setStatus('loading')
    try {
      const token = await requestNotificationPermission()
      if (!token) { setStatus('denied'); return }

      const medications = getMedications().filter(m => m.active)

      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, medications }),
      })

      setStatus('granted')
    } catch {
      setStatus('denied')
    }
  }

  return { status, subscribe }
}