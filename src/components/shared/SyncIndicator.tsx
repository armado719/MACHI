'use client'

import { Cloud, CloudOff, Loader2, RefreshCw } from 'lucide-react'
import { useSyncQueue } from '@/hooks/useSyncQueue'
import { cn } from '@/lib/utils'

export function SyncIndicator() {
  const { isOnline, pendingCount, isSyncing, runSync } = useSyncQueue()

  if (isOnline && pendingCount === 0 && !isSyncing) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-content-muted">
        <Cloud className="w-3.5 h-3.5" />
        Sincronizado
      </div>
    )
  }

  return (
    <button
      onClick={runSync}
      disabled={!isOnline || isSyncing}
      className={cn(
        'flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border transition-colors',
        isOnline
          ? 'bg-amber-bg text-amber border-amber/30 hover:bg-amber/10'
          : 'bg-red-bg text-red border-red/30'
      )}
      title={isOnline ? 'Sincronizar ahora' : 'Sin conexión — los registros se guardan localmente'}
    >
      {isSyncing ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isOnline ? (
        <RefreshCw className="w-3.5 h-3.5" />
      ) : (
        <CloudOff className="w-3.5 h-3.5" />
      )}
      {isOnline
        ? isSyncing
          ? 'Sincronizando…'
          : `${pendingCount} pendiente${pendingCount === 1 ? '' : 's'} de sincronizar`
        : `${pendingCount} sin conexión`}
    </button>
  )
}
