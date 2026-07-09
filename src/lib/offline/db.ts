import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

export interface PendingRegistro {
  localId: string
  registroId?: string // presente si es edición de un registro ya creado en el servidor
  payload: Record<string, unknown>
  createdAt: number
  attempts: number
  lastError?: string
}

interface MachiDB extends DBSchema {
  'pending-registros': {
    key: string
    value: PendingRegistro
  }
}

const DB_NAME = 'machi-offline'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<MachiDB>> | null = null

function getDb() {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB solo está disponible en el navegador')
  }
  if (!dbPromise) {
    dbPromise = openDB<MachiDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('pending-registros')) {
          db.createObjectStore('pending-registros', { keyPath: 'localId' })
        }
      },
    })
  }
  return dbPromise
}

export async function queueRegistro(entry: Omit<PendingRegistro, 'attempts' | 'createdAt'>) {
  const db = await getDb()
  await db.put('pending-registros', {
    ...entry,
    createdAt: Date.now(),
    attempts: 0,
  })
}

export async function getPendingRegistros(): Promise<PendingRegistro[]> {
  const db = await getDb()
  return db.getAll('pending-registros')
}

export async function removePendingRegistro(localId: string) {
  const db = await getDb()
  await db.delete('pending-registros', localId)
}

export async function updatePendingRegistro(entry: PendingRegistro) {
  const db = await getDb()
  await db.put('pending-registros', entry)
}

export async function countPendingRegistros(): Promise<number> {
  const db = await getDb()
  return db.count('pending-registros')
}
