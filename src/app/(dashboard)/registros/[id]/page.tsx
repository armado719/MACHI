import { RegistroForm } from '@/components/modules/registros/RegistroForm'

export default function EditarRegistroPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-content">Editar registro</h1>
        <p className="text-content-muted text-sm mt-1">
          Ajuste los valores del turno — los cambios quedan en el historial de auditoría
        </p>
      </div>
      <RegistroForm mode="editar" registroId={params.id} />
    </div>
  )
}
