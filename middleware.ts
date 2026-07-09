import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const role = token.role as string

    // Solo ADMIN administra sedes, equipos y configuración
    if (
      pathname.startsWith('/sedes') ||
      pathname.startsWith('/equipos') ||
      pathname.startsWith('/configuracion')
    ) {
      if (role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Solo COORDINADOR y ADMIN aprueban registros
    if (pathname.startsWith('/aprobacion') && role === 'ELECTROMECANICO') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/registros/:path*',
    '/aprobacion/:path*',
    '/alertas/:path*',
    '/sedes/:path*',
    '/equipos/:path*',
    '/configuracion/:path*',
  ],
}
