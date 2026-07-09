import { RegistroForm } from '@/components/modules/registros/RegistroForm'

export default function NuevoRegistroPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-content">Nuevo registro</h1>
        <p className="text-content-muted text-sm mt-1">
          Registro de horómetros y combustible del turno
        </p>
      </div>
      <RegistroForm mode="nuevo" />
    </div>
  )
}
