'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // registro fallido — la app sigue funcionando online, solo sin cache offline
      })
    }
  }, [])

  return null
}
