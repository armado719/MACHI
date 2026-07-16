'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Gauge } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Ingrese un email válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Credenciales incorrectas. Verifique su email y contraseña.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Ocurrió un error. Intente nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* Columna del formulario */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-bg-surface border border-border rounded-2xl shadow-md p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-3">
                <div className="w-14 h-14 rounded-xl bg-steel flex items-center justify-center">
                  <Gauge className="w-7 h-7 text-white" />
                </div>
              </div>
              <h1 className="font-display text-3xl font-semibold text-content tracking-wide leading-none">
                MACHI
              </h1>
              <p className="text-content-muted text-xs font-sans mt-2">
                Tracker de Horómetros y Combustible
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-content mb-1.5">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-content placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-steel focus:border-steel transition-colors text-sm"
                  placeholder="correo@empresa.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-content mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-border bg-white text-content placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-steel focus:border-steel transition-colors text-sm"
                    placeholder="••••••••"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-bg border border-red/20">
                  <p className="text-sm text-red">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-steel hover:bg-steel-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-content-muted">
              © {new Date().getFullYear()} Gworks Services S.A.S. — Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>

      {/* Panel de imagen — oculto en pantallas pequeñas */}
      <div className="hidden lg:block relative flex-1 overflow-hidden">
        <div
          className="absolute inset-0 bg-no-repeat animate-kenburns"
          style={{
            backgroundImage: "url('/login.png')",
            backgroundSize: 'auto 170%',
            backgroundPosition: '78% 85%',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-steel-dark/70 via-steel-dark/10 to-steel-dark/40" />
      </div>
    </div>
  )
}
