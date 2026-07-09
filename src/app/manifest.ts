import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MACHI — Tracker de Horómetros y Combustible',
    short_name: 'MACHI',
    description: 'Registro digital de horómetros y consumo de combustible por equipo',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F4F6F8',
    theme_color: '#3E5C76',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
