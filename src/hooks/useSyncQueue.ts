'use client'

import { useCallback, useEffect, useState } from 'react'
import { countPendingRegistros } from '@/lib/offline/db'
import { syncPendingRegistros } from '@/lib/offline/sync'
import { useOnlineStatus } from './useOnlineStatus'

export function useSyncQueue() {
  const isOnline = useOnlineStatus()
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  const refreshCount = useCallback(async () => {
    try {
      setPendingCount(await countPendingRegistros())
    } catch {
      // IndexedDB no disponible (SSR) — ignorar
    }
  }, [])

  const runSync = useCallback(async () => {
    if (isSyncing) return
    setIsSyncing(true)
    try {
      await syncPendingRegistros()
    } finally {
      await refreshCount()
      setIsSyncing(false)
    }
  }, [isSyncing, refreshCount])

  useEffect(() => {
    refreshCount()
    const interval = setInterval(refreshCount, 15_000)
    return () => clearInterval(interval)
  }, [refreshCount])

  useEffect(() => {
    if (isOnline) {
      runSync()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline])

  return { isOnline, pendingCount, isSyncing, runSync, refreshCount }
}
