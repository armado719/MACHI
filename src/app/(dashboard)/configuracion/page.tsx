'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { TabEmpresa } from '@/components/modules/configuracion/TabEmpresa'
import { TabUsuarios } from '@/components/modules/configuracion/TabUsuarios'

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-content">Configuración</h1>
        <p className="text-content-muted text-sm mt-1">
          Empresa, usuarios y parámetros globales del sistema
        </p>
      </div>

      <Tabs defaultValue="empresa">
        <TabsList>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
        </TabsList>
        <TabsContent value="empresa">
          <TabEmpresa />
        </TabsContent>
        <TabsContent value="usuarios">
          <TabUsuarios />
        </TabsContent>
      </Tabs>
    </div>
  )
}
