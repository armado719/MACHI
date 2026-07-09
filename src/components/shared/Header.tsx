'use client'

import { usePathname } from 'next/navigation'
import { SyncIndicator } from './SyncIndicator'

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/registros': 'Registro diario',
  '/aprobacion': 'Aprobación de registros',
  '/alertas': 'Alertas',
  '/sedes': 'Sedes',
  '/equipos': 'Equipos',
  '/configuracion': 'Configuración',
}

function resolveTitle(pathname: string): string {
  const match = Object.keys(TITLES).find((key) => pathname.startsWith(key))
  return match ? TITLES[match] : 'MACHI'
}

export function Header() {
  const pathname = usePathname()

  return (
    <header
      data-header
      className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur border-b border-border flex items-center justify-between px-6"
    >
      <h2 className="font-display text-lg font-semibold text-content tracking-wide">
        {resolveTitle(pathname)}
      </h2>
      <SyncIndicator />
    </header>
  )
}
