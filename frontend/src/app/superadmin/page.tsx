"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export default function SuperAdminPage() {
  const [metrics, setMetrics] = useState({
    total_tenants: 0,
    total_users: 0,
    total_invoices: 0,
    total_revenue: 0
  })
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const [resMetrics, resTenants] = await Promise.all([
        fetch("http://localhost:8000/api/v1/superadmin/metrics", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://localhost:8000/api/v1/superadmin/tenants", { headers: { "Authorization": `Bearer ${token}` } })
      ])
      
      if (resMetrics.ok) setMetrics(await resMetrics.json())
      if (resTenants.ok) setTenants(await resTenants.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleToggleStatus = async (tenantId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active"
    const confirmMessage = currentStatus === "active" 
      ? "¿Estás seguro de SUSPENDER esta empresa? No podrán acceder al sistema." 
      : "¿Estás seguro de REACTIVAR esta empresa?"
      
    if (!confirm(confirmMessage)) return

    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`http://localhost:8000/api/v1/superadmin/tenants/${tenantId}/status?status=${newStatus}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        fetchData()
      } else {
        alert("Error cambiando el estado")
      }
    } catch (e) {
      alert("Error de red")
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel Maestro (God Mode)</h1>
        <p className="text-base text-gray-500 dark:text-gray-400 mt-2">Visibilidad total de la plataforma GestionApp SaaS.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_tenants}</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_users}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Procesadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_invoices}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volumen Transaccionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.total_revenue.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">Listado de Empresas (Tenants)</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Identificador Fiscal</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Usuarios</TableHead>
              <TableHead>Facturas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">Escaneando sistema...</TableCell>
              </TableRow>
            ) : tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">No hay empresas registradas aún.</TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div className="font-medium text-gray-900 dark:text-white">{tenant.commercial_name}</div>
                    <div className="text-xs text-gray-500">{tenant.legal_name}</div>
                  </TableCell>
                  <TableCell>{tenant.cuit_rut}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                      {tenant.subscription_plan}
                    </span>
                  </TableCell>
                  <TableCell>{tenant.users_count}</TableCell>
                  <TableCell>{tenant.invoices_count}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tenant.subscription_status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tenant.subscription_status === 'active' ? 'Activa' : 'Suspendida'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={tenant.subscription_status === 'active' ? "text-red-600 border-red-200 hover:bg-red-50" : "text-green-600 border-green-200 hover:bg-green-50"}
                      onClick={() => handleToggleStatus(tenant.id, tenant.subscription_status)}
                    >
                      {tenant.subscription_status === 'active' ? 'Suspender' : 'Reactivar'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
