'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  AlertTriangle,
  Building2,
  Truck,
  Settings,
  LogOut,
  Gauge,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Role } from '@/types'
import { ROLE_LABELS } from '@/types'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles?: Role[]
  badge?: 'alertas'
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/registros', label: 'Registro diario', icon: ClipboardList },
  {
    href: '/aprobacion',
    label: 'Aprobación',
    icon: CheckSquare,
    roles: ['COORDINADOR', 'ADMIN'],
  },
  { href: '/alertas', label: 'Alertas', icon: AlertTriangle, badge: 'alertas' },
  { href: '/sedes', label: 'Sedes', icon: Building2, roles: ['ADMIN'] },
  { href: '/equipos', label: 'Equipos', icon: Truck, roles: ['ADMIN'] },
  { href: '/configuracion', label: 'Configuración', icon: Settings, roles: ['ADMIN'] },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role as Role | undefined
  const [alertasCount, setAlertasCount] = useState(0)

  useEffect(() => {
    async function fetchAlertas() {
      try {
        const res = await fetch('/api/alertas?estado=ACTIVA')
        if (res.ok) {
          const data = await res.json()
          setAlertasCount(data.total ?? 0)
        }
      } catch {
        // silent
      }
    }

    fetchAlertas()
    const interval = setInterval(fetchAlertas, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || !userRole || item.roles.includes(userRole)
  )

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-white border-r border-border flex flex-col z-40">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-steel flex items-center justify-center shrink-0">
            <Gauge className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-content tracking-wide leading-none">
              MACHI
            </h1>
            <p className="text-xs text-content-muted mt-0.5 font-sans">
              Empresa X
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        {filteredNavItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const showBadge = item.badge === 'alertas' && alertasCount > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                active
                  ? 'bg-steel text-white'
                  : 'text-content-muted hover:bg-bg-base hover:text-content'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0',
                  active ? 'text-white' : 'text-content-muted group-hover:text-steel'
                )}
              />
              <span className="flex-1">{item.label}</span>
              {showBadge && !active && (
                <span className="text-[10px] font-semibold bg-red text-white rounded-full px-1.5 py-0.5 leading-none">
                  {alertasCount}
                </span>
              )}
              {active && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-bg-base border border-border flex items-center justify-center text-xs font-medium text-content shrink-0">
            {session?.user?.name ? getInitials(session.user.name) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-content truncate">
              {session?.user?.name || 'Usuario'}
            </p>
            <p className="text-xs text-content-muted">
              {userRole ? ROLE_LABELS[userRole] : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-content-muted hover:bg-red-bg hover:text-red transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
