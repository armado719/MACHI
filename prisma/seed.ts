import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('machi2026', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@empresax.com' },
    update: {},
    create: {
      name: 'Admin Empresa X',
      email: 'admin@empresax.com',
      password,
      role: 'ADMIN',
    },
  })

  await prisma.user.upsert({
    where: { email: 'coordinador@empresax.com' },
    update: {},
    create: {
      name: 'Carlos Coordinador',
      email: 'coordinador@empresax.com',
      password,
      role: 'COORDINADOR',
    },
  })

  await prisma.user.upsert({
    where: { email: 'electromecanico@empresax.com' },
    update: {},
    create: {
      name: 'Luis Electromecánico',
      email: 'electromecanico@empresax.com',
      password,
      role: 'ELECTROMECANICO',
    },
  })

  const sedeBogota = await prisma.sede.upsert({
    where: { id: 'seed-sede-bogota' },
    update: {},
    create: {
      id: 'seed-sede-bogota',
      nombre: 'Campamento Bogotá',
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
    },
  })

  const sedeMedellin = await prisma.sede.upsert({
    where: { id: 'seed-sede-medellin' },
    update: {},
    create: {
      id: 'seed-sede-medellin',
      nombre: 'Campamento Medellín',
      ciudad: 'Medellín',
      departamento: 'Antioquia',
    },
  })

  await prisma.equipo.upsert({
    where: { id: 'seed-equipo-1' },
    update: {},
    create: {
      id: 'seed-equipo-1',
      sedeId: sedeBogota.id,
      nombre: 'Excavadora CAT-320 #01',
      marca: 'Caterpillar',
      modelo: '320',
      serie: 'CAT320-0001',
      capacidadTanqueGalones: 120,
      intervaloMantenimientoHoras: 250,
      umbralAmarilloHoras: 30,
      umbralRojoHoras: 10,
    },
  })

  await prisma.equipo.upsert({
    where: { id: 'seed-equipo-2' },
    update: {},
    create: {
      id: 'seed-equipo-2',
      sedeId: sedeBogota.id,
      nombre: 'Volqueta Kenworth #04',
      marca: 'Kenworth',
      modelo: 'T800',
      serie: 'KW800-0004',
      capacidadTanqueGalones: 80,
      intervaloMantenimientoHoras: 300,
      umbralAmarilloHoras: 30,
      umbralRojoHoras: 10,
    },
  })

  await prisma.equipo.upsert({
    where: { id: 'seed-equipo-3' },
    update: {},
    create: {
      id: 'seed-equipo-3',
      sedeId: sedeMedellin.id,
      nombre: 'Retroexcavadora JCB #02',
      marca: 'JCB',
      modelo: '3CX',
      serie: 'JCB3CX-0002',
      capacidadTanqueGalones: 90,
      intervaloMantenimientoHoras: 250,
      umbralAmarilloHoras: 30,
      umbralRojoHoras: 10,
    },
  })

  await prisma.configuracionGlobal.upsert({
    where: { id: 'seed-config' },
    update: { nombreEmpresa: 'Gworks Services S.A.S.' },
    create: {
      id: 'seed-config',
      nombreEmpresa: 'Gworks Services S.A.S.',
      costoPorGalon: 10500,
      umbralAnomaliaPorcentaje: 30,
    },
  })

  console.log('Seed completo. Usuarios demo (contraseña: machi2026):')
  console.log('  admin@empresax.com — Admin')
  console.log('  coordinador@empresax.com — Coordinador')
  console.log('  electromecanico@empresax.com — Electromecánico')
  console.log(`Admin id: ${admin.id}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
