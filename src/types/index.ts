export type Role = 'ELECTROMECANICO' | 'COORDINADOR' | 'ADMIN'
export type Turno = 'DIA' | 'NOCHE'
export type EstadoRegistro = 'BORRADOR' | 'ENVIADO' | 'APROBADO' | 'RECHAZADO'
export type SeveridadAlerta = 'AMARILLA' | 'ROJA'
export type TipoAlerta = 'MANTENIMIENTO_PROXIMO' | 'MANTENIMIENTO_VENCIDO' | 'CONSUMO_ANOMALO'
export type EstadoAlerta = 'ACTIVA' | 'RECONOCIDA'

export const ROLE_LABELS: Record<Role, string> = {
  ELECTROMECANICO: 'Electromecánico',
  COORDINADOR: 'Coordinador',
  ADMIN: 'Administrador',
}

export const TURNO_LABELS: Record<Turno, string> = {
  DIA: 'Día',
  NOCHE: 'Noche',
}

export const ESTADO_REGISTRO_LABELS: Record<EstadoRegistro, string> = {
  BORRADOR: 'Borrador',
  ENVIADO: 'Enviado',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
}

export const TIPO_ALERTA_LABELS: Record<TipoAlerta, string> = {
  MANTENIMIENTO_PROXIMO: 'Mantenimiento próximo',
  MANTENIMIENTO_VENCIDO: 'Mantenimiento vencido',
  CONSUMO_ANOMALO: 'Consumo anómalo',
}
