import {
  getPendingRegistros,
  removePendingRegistro,
  updatePendingRegistro,
} from './db'

export type SyncResult = {
  synced: number
  failed: number
}

/**
 * Envía la cola local a /api/sync. Reintenta con backoff en próximas llamadas
 * (no bloquea aquí) — cada registro fallido queda en la cola con su error.
 */
export async function syncPendingRegistros(): Promise<SyncResult> {
  const pending = await getPendingRegistros()
  let synced = 0
  let failed = 0

  for (const entry of pending) {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registroId: entry.registroId,
          payload: entry.payload,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Error ${res.status}`)
      }

      await removePendingRegistro(entry.localId)
      synced++
    } catch (err) {
      failed++
      await updatePendingRegistro({
        ...entry,
        attempts: entry.attempts + 1,
        lastError: err instanceof Error ? err.message : 'Error desconocido',
      })
    }
  }

  return { synced, failed }
}
