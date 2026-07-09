import { prisma } from '@/lib/prisma'

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'APROBAR' | 'RECHAZAR'

export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  changes,
  motivo,
  ip,
}: {
  userId: string
  action: AuditAction
  entity: string
  entityId: string
  changes?: Record<string, unknown>
  motivo?: string
  ip?: string
}) {
  try {
    await prisma.logAuditoria.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        changes: changes ? (changes as import('@prisma/client').Prisma.InputJsonValue) : undefined,
        motivo,
        ip: ip ?? 'unknown',
      },
    })
  } catch {
    // La auditoría nunca debe romper la operación principal
  }
}
