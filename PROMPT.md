# MACHI — PWA Tracker de Horómetros y Combustible
## Cliente: [EMPRESA X] (nombre y logo provisionales — branding pendiente de confirmación)

> Nota: este NO es un módulo de GRS/RIG 158. Es un proyecto independiente para otra
> empresa, provisionalmente llamada "Empresa X" hasta confirmar nombre y logo
> definitivos. La identidad visual usa una paleta clara neutra industrial como base
> provisional (no la paleta oscura del portafolio ARC), reemplazable cuando se
> confirme el branding real de Empresa X.

---

## INSTRUCCIONES GENERALES PARA LA IA

- Todo el sistema, incluyendo UI, mensajes de error, validaciones, tooltips, PDFs y
  comentarios de código, debe estar **100% en español**.
- Los nombres de variables, funciones, tipos y tablas de base de datos van en
  **inglés** (convención de código).
- Antes de crear un archivo nuevo, verificar si ya existe uno reutilizable.
- Confirmar con el usuario antes de eliminar cualquier registro (modal de
  confirmación).
- Validar todos los formularios con Zod antes de enviar al backend.
- Nunca eliminar registros físicamente — usar **soft delete** (`deletedAt: DateTime?`).
- Usar **API Routes de Next.js 15** para todas las mutaciones (patrón consistente con
  Medi One) — no Server Actions, para mantener un único punto de entrada reusable
  también por el sync offline-first.
- Mensajes de error al usuario: tono neutral y directo. Ejemplo:
  `"Ya existe un registro para esta sede, fecha y turno"`, no `"Error 409"`.

---

## STACK TECNOLÓGICO

### Frontend
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS — tokens del sistema ARC (ver "Sistema de diseño")
- React Hook Form + Zod (validación)
- TanStack Table v8 (tablas con paginación)
- Recharts (gráficas de tendencia — Fase 2)
- @react-pdf/renderer (generación de PDFs)
- exceljs (exportar Excel — hoja larga pivoteable)
- Lucide Icons
- Sonner (toast notifications)
- date-fns (manejo de fechas, locale es)
- idb (wrapper de IndexedDB para el buffer offline)

### Backend / Persistencia
- Next.js API Routes (sin servicio Express separado — no hay integración con
  sistemas externos por ahora)
- Prisma ORM 5.x
- MySQL 8.x

### Auth
- NextAuth.js v4 con CredentialsProvider
- Roles: `ELECTROMECANICO`, `COORDINADOR`, `ADMIN`
- Sesión expira a las 12 horas (turnos largos tipo 14x14)
- Middleware de protección por ruta según rol

### PWA
- Offline-first: IndexedDB como buffer local de registros no sincronizados
- Service worker con cache de shell de la app
- Sincronización automática a MySQL al recuperar conexión
- Indicador visual de "pendiente de sincronizar" + cola visible

### Almacenamiento
- Fotos de evidencia: carpeta `/public/uploads/registros/[registroId]/`

---

## VARIABLES DE ENTORNO (.env.example)

```env
# Base de datos
DATABASE_URL="mysql://root:@localhost:3306/machi"

# NextAuth
NEXTAUTH_SECRET="cambia-esta-clave-en-produccion"
NEXTAUTH_URL="http://localhost:3000"

# Almacenamiento
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE_MB=5

# App
APP_NAME="MACHI"
APP_URL="http://localhost:3000"
```

---

## ESTRUCTURA DE CARPETAS

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Layout con sidebar
│   │   ├── dashboard/              # Dashboard/histórico
│   │   ├── registros/              # Registro diario (Electromecánico)
│   │   ├── aprobacion/             # Aprobación (Coordinador)
│   │   ├── alertas/                # Panel de alertas
│   │   ├── sedes/                  # CRUD sedes (Admin)
│   │   ├── equipos/                # CRUD equipos (Admin)
│   │   └── configuracion/          # Usuarios, costo/galón, umbrales globales
│   ├── manifest.ts                 # PWA manifest
│   └── api/
│       ├── auth/
│       ├── sedes/
│       ├── equipos/
│       ├── registros/
│       ├── alertas/
│       ├── export/
│       │   ├── pdf/
│       │   └── excel/
│       └── sync/                   # endpoint de sincronización offline
├── components/
│   ├── ui/                         # componentes base (Button, Input, Select...)
│   ├── shared/                     # Header, Sidebar, PageHeader, SyncIndicator
│   └── modules/                    # componentes por módulo
├── lib/
│   ├── auth.ts                     # NextAuth config
│   ├── prisma.ts                   # Singleton del cliente Prisma
│   ├── audit.ts                    # logAudit()
│   ├── alertas.ts                  # cálculo de umbrales / anomalías
│   ├── offline/
│   │   ├── db.ts                   # IndexedDB (idb) — cola local
│   │   └── sync.ts                 # sincronización al reconectar
│   ├── pdf/                        # plantillas PDF
│   ├── excel/                      # generadores de hoja Excel
│   └── utils.ts
├── hooks/
├── types/
├── validations/                    # esquemas Zod por módulo
└── prisma/
    ├── schema.prisma
    ├── migrations/
    └── seed.ts
```

---

## SISTEMA DE DISEÑO (base clara neutra industrial — reemplazable)

### Paleta de colores

```ts
colors: {
  bg: {
    base:    '#F4F6F8',
    surface: '#FFFFFF',
  },
  steel:   { DEFAULT: '#3E5C76', light: '#6C8EAE', dark: '#26374A' }, // acento principal
  amber:   { DEFAULT: '#D98E04', light: '#F5C563', bg: '#FEF3DA' },   // alerta amarilla
  red:     { DEFAULT: '#D6402F', light: '#F2897B', bg: '#FBE2DE' },   // alerta roja / crítico
  green:   { DEFAULT: '#2F9E5B', bg: '#DFF3E7' },                     // ok / aprobado
  content: {
    DEFAULT: '#1C2430',
    muted:   '#64748B',
  },
  border:  '#E2E5EA',
}
```

### Tipografía
- Títulos: `Barlow Condensed` (peso 600/700) — look técnico/industrial
- Cuerpo: `Inter` (pesos 400, 500, 600)

### Estilo general
- Fondo claro (`bg-base`), tarjetas blancas (`bg-surface`) con borde sutil `border`
- Bordes redondeados: `rounded-xl`
- Badges de estado con color semántico (ámbar/rojo/verde), reservados para
  severidad de alertas y estados de aprobación — no decorativos
- Iconos: Lucide, tamaño base 18px

> El logo, nombre comercial y ajustes finos de paleta se reemplazan cuando Empresa X
> confirme su identidad visual — todos los tokens viven en `tailwind.config.ts` y
> `ConfiguracionGlobal` (tabla en BD) para poder cambiarse sin tocar componentes.

---

## MODELO DE DATOS (Prisma / MySQL)

### Relaciones principales
```
Sede (1) ──────────── (N) Equipo
Sede (1) ──────────── (N) RegistroDiario
Equipo (1) ─────────── (N) LecturaEquipo
RegistroDiario (1) ─── (N) LecturaEquipo
Usuario (1) ────────── (N) RegistroDiario (creadoPor)
Usuario (1) ────────── (N) RegistroDiario (aprobadoPor)
Usuario (1) ────────── (N) LogAuditoria
Equipo (1) ─────────── (N) Alerta
Usuario (1) ────────── (N) AsignacionTurno (Fase 2)
```

### Campos obligatorios en todos los modelos
```prisma
id        String   @id @default(cuid())
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
deletedAt DateTime?   // soft delete — nunca borrar físicamente
```

### Enums
```prisma
enum Role            { ELECTROMECANICO COORDINADOR ADMIN }
enum Turno            { DIA NOCHE }
enum EstadoRegistro    { BORRADOR ENVIADO APROBADO RECHAZADO }
enum SeveridadAlerta   { AMARILLA ROJA }
enum TipoAlerta        { MANTENIMIENTO_PROXIMO MANTENIMIENTO_VENCIDO CONSUMO_ANOMALO }
enum EstadoAlerta      { ACTIVA RECONOCIDA }
```

### Modelos clave (resumen — ver `prisma/schema.prisma` para el detalle real)
- **Sede**: nombre, ciudad, departamento
- **Equipo**: sedeId, nombre, marca, modelo, serie, capacidadTanqueGalones,
  intervaloMantenimientoHoras, umbralAmarilloHoras, umbralRojoHoras, activo,
  ultimoHorometro (caché para validar retroceso rápido)
- **RegistroDiario**: sedeId, fecha, turno, estado, creadoPorId, aprobadoPorId,
  comentarioAprobacion, `@@unique([sedeId, fecha, turno])` para evitar duplicados
  (la edición del registro existente se hace por su id, no creando uno nuevo)
- **LecturaEquipo**: registroDiarioId, equipoId, horometro, combustibleGalones
  (nullable — null = no reportado, 0 = consumo real cero), fotoEvidenciaUrl,
  hallazgos (texto libre — Fase 3 lo vincula a equipoId estructurado), deltaHoras
  (calculado contra la lectura anterior del mismo equipo)
- **Alerta**: equipoId, tipo, severidad, estado, mensaje, reconocidaPorId,
  reconocidaAt
- **LogAuditoria**: userId, action, entity, entityId, changes (JSON), motivo
  (obligatorio cuando Admin corrige un registro aprobado)
- **ConfiguracionGlobal**: costoPorGalon, nombreEmpresa, logoUrl (singleton)

---

## MÓDULOS — FASE 1 (MVP)

### 1. Registro diario
- Formulario fiel al formato actual de correo.
- El usuario (Electromecánico) selecciona la **sede** donde está trabajando ese
  turno (no es fija, rota por ciclo) → carga grid dinámico de equipos activos de
  esa sede.
- Por cada equipo: horómetro (número), combustible en galones (número o vacío —
  diferenciar explícitamente de "0 Gls"), foto de evidencia opcional, hallazgos
  (texto libre).
- Botón **"duplicar registro anterior"**: precarga los valores del último registro
  de esa sede/turno como punto de partida (el electromecánico solo ajusta lo que
  cambió).
- Guardar como borrador o enviar para aprobación.
- Validación: horómetro no puede retroceder respecto al último registro del mismo
  equipo → **advertencia, no bloqueo** (puede haber cambio de equipo).
- Validación: no duplicar sede+fecha+turno — si ya existe, se redirige a editar el
  registro existente en vez de crear uno nuevo. Manejar concurrencia: si dos
  electromecánicos abren el mismo registro, el segundo guardado debe detectar el
  conflicto (optimistic locking vía `updatedAt`) y avisar en vez de sobrescribir
  silenciosamente.

### 2. Sedes (Admin)
- CRUD: nombre, ciudad, departamento.

### 3. Configuración de equipos (Admin)
- CRUD con ficha técnica completa: marca, modelo, serie, capacidad de tanque,
  intervalo de mantenimiento, umbrales de alerta (amarillo/rojo), por sede.

### 4. Aprobación (Coordinador)
- Revisa registros en estado `ENVIADO`, filtra por sede (el coordinador también
  rota, no está limitado a una sede fija).
- Aprueba o rechaza con comentario obligatorio en caso de rechazo.
- Registro aprobado queda bloqueado para edición — solo Admin puede corregirlo,
  dejando el motivo registrado en `LogAuditoria`.

### 5. Dashboard / histórico
- Filtrable por fecha, equipo, sede.
- Delta de horas trabajadas, consumo acumulado, costo acumulado (usa
  `costoPorGalon` de `ConfiguracionGlobal`).

### 6. Alertas
- Escalonadas: amarilla (próximo a umbral) / roja (vencido o crítico).
- Detección de consumo anómalo: equipo que se desvía significativamente
  (> N desviaciones estándar o % configurable) de su promedio histórico de
  Gls/Hr.
- Panel de reconocimiento de alertas, filtrable por sede.

### 7. Exportar PDF
- Layout igual al formato actual del correo "Registro de actividades".

### 8. Exportar Excel
- Individual (un registro) y consolidado histórico.
- **Una sola hoja, formato largo**: fecha, sede, turno, equipo, horómetro,
  combustible, costo, delta horas — pivoteable directo en Excel.
- Vía `exceljs`.

### 9. Roles y autenticación
- **Electromecánico**: captura registros, elige sede al registrar.
- **Coordinador**: aprueba/revisa, filtra por sede desde el dashboard.
- **Admin**: configura equipos, usuarios, sedes, umbrales — acceso global.

### 10. Offline-first
- Indicador visual de "pendiente de sincronizar".
- Cola visible de registros por subir.
- Sync automático al reconectar (reintento con backoff, sin perder datos si falla).

---

## ROLES Y PERMISOS (detallado)

| Módulo | ELECTROMECANICO | COORDINADOR | ADMIN |
|--------|:---:|:---:|:---:|
| Registro diario — crear/editar propio (no aprobado) | ✅ | ❌ | ✅ |
| Registro diario — ver | solo propios | por sede filtrada | ✅ todos |
| Aprobación — aprobar/rechazar | ❌ | ✅ | ✅ |
| Registro aprobado — corregir | ❌ | ❌ | ✅ (con motivo en auditoría) |
| Sedes — CRUD | ❌ | ❌ | ✅ |
| Equipos — CRUD | ❌ | ❌ | ✅ |
| Dashboard/histórico — ver | solo propios/su sede actual | por sede filtrada | ✅ todo |
| Alertas — ver/reconocer | solo su sede actual | por sede filtrada | ✅ todo |
| Exportar PDF/Excel | propios | por sede filtrada | ✅ todo |
| Configuración (usuarios, costo/galón, umbrales globales) | ❌ | ❌ | ✅ |

---

## VALIDACIONES CLAVE

| Situación | Comportamiento |
|-----------|---------------|
| Horómetro retrocede respecto al último registro del equipo | Advertir, no bloquear (puede haber cambio de equipo) |
| Combustible no reportado vs. 0 Gls reales | Campo nullable — `null` ≠ `0`, se muestra distinto en UI ("Sin dato" vs "0 Gls") |
| Registro duplicado de sede+fecha+turno | No crear uno nuevo — redirigir a editar el existente |
| Edición concurrente del mismo registro | Optimistic locking por `updatedAt`; segundo guardado avisa conflicto |
| Registro aprobado editado | Bloqueado salvo Admin; corrección exige motivo, queda en `LogAuditoria` |
| Sesión expirada | Redirigir a `/login` con `"Tu sesión ha expirado"` |
| Foto de evidencia muy grande | `"La imagen no puede superar XMB"` |

---

## FASES DE DESARROLLO

### Fase 1 — MVP
- [ ] Setup: Next.js 15 + Prisma + MySQL + NextAuth funcionando
- [ ] Login con 3 roles, middleware por rol
- [ ] CRUD Sedes (Admin)
- [ ] CRUD Equipos con ficha técnica y umbrales (Admin)
- [ ] Registro diario: formulario, grid dinámico, duplicar anterior, foto evidencia
- [ ] Aprobación por Coordinador (filtrada por sede) + bloqueo post-aprobación
- [ ] Dashboard/histórico con filtros y acumulados
- [ ] Alertas escalonadas + consumo anómalo + panel de reconocimiento
- [ ] Exportar PDF (layout del correo actual)
- [ ] Exportar Excel (individual + consolidado, hoja larga)
- [ ] Offline-first: IndexedDB + indicador + sync automático

### Fase 2 — Analítica y automatización
- [ ] Cálculo automático de rendimiento (Gls/Hr) por equipo/periodo
- [ ] Proyección de próximo mantenimiento (promedio horas/día, no solo umbral fijo)
- [ ] Gráficas comparativas de tendencia (horómetro y combustible)
- [ ] Notificaciones push PWA en alertas
- [ ] Envío automático de PDF/Excel por correo al aprobar
- [ ] Autocompletar nombre del ejecutor (últimos usados)
- [ ] Dashboard ejecutivo de solo lectura con KPIs
- [ ] Reporte mensual consolidado en PDF con gráficas
- [ ] Reportes comparativos entre sedes
- [ ] Módulo de turnos/roster (`AsignacionTurno`: usuario, sede, fecha_inicio,
      fecha_fin, tipo_ciclo ej. '14x14') — autocompleta sede al iniciar registro,
      panel de "quién debería estar reportando hoy y no lo ha hecho", base para
      sync con Google Calendar en Fase 3

### Fase 3 — Automatización y resiliencia
- [ ] Vincular hallazgos/actividades a un `equipoId` específico (hoy texto libre)
- [ ] Integración n8n: alerta roja → WhatsApp/Telegram del coordinador
- [ ] Sincronización con Google Calendar (mantenimientos proyectados)
- [ ] Backup automático programado de MySQL + botón manual desde la app
- [ ] Modo "captura rápida" tipo checklist para turnos sin novedades
- [ ] API/webhook para integrar con un ERP externo (si Empresa X lo requiere)

---

## PENDIENTE POR DEFINIR CON EL USUARIO

- Nombre real y logo de Empresa X (reemplaza branding provisional ARC).

---

**Empezar siempre por la Fase 1 en el orden listado. No avanzar a la siguiente fase
sin completar los criterios de aceptación de la anterior.**
