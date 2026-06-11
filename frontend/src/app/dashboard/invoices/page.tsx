"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [customersMap, setCustomersMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    
    try {
      // Fetch customers to build name map
      const custRes = await fetch("http://localhost:8000/api/v1/customers/", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (custRes.ok) {
        const custData = await custRes.json()
        const map: Record<string, string> = {}
        custData.forEach((c: any) => { map[c.id] = c.business_name })
        setCustomersMap(map)
      }

      // Fetch invoices
      const invRes = await fetch("http://localhost:8000/api/v1/invoices/", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (invRes.ok) {
        const invData = await invRes.json()
        setInvoices(invData)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Facturación</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestiona tus facturas electrónicas con TusFacturasAPP.</p>
        </div>
        
        <Link href="/dashboard/invoices/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">+ Nueva Factura</Button>
        </Link>
      </div>

      <div className="border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">Cargando facturas...</TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">No hay facturas registradas. Crea una nueva.</TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.issue_date}</TableCell>
                  <TableCell>{customersMap[invoice.customer_id] || invoice.customer_id}</TableCell>
                  <TableCell>{invoice.invoice_type}</TableCell>
                  <TableCell>${invoice.total}</TableCell>
                  <TableCell>
                    {invoice.status === "draft" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Borrador</span>
                    )}
                    {invoice.status === "processing" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Procesando</span>
                    )}
                    {invoice.status === "approved" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Enviada</span>
                    )}
                    {invoice.status === "rejected" && (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rechazada</span>
                        {invoice.error_message && (
                          <span className="text-[10px] leading-tight text-red-500 max-w-[200px]" title={invoice.error_message}>
                            {invoice.error_message}
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {invoice.status === "approved" && invoice.pdf_url && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-indigo-600"
                        onClick={async () => {
                          const token = localStorage.getItem("token");
                          try {
                            const res = await fetch(`http://localhost:8000/api/v1/invoices/${invoice.id}/pdf`, {
                              headers: { "Authorization": `Bearer ${token}` }
                            });
                            const data = await res.json();
                            if (data.url) {
                              window.open(data.url, '_blank');
                            }
                          } catch(e) {
                            alert("Error abriendo PDF");
                          }
                        }}
                      >
                        Ver PDF
                      </Button>
                    )}
                    {(invoice.status === "draft" || invoice.status === "rejected") && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={async () => {
                          const token = localStorage.getItem("token");
                          try {
                            const res = await fetch(`http://localhost:8000/api/v1/invoices/${invoice.id}/emit`, {
                              method: "POST",
                              headers: { "Authorization": `Bearer ${token}` }
                            });
                            if (res.ok) {
                              fetchData(); // Refresh the list
                            } else {
                              alert("Error al emitir la factura");
                            }
                          } catch (e) {
                            alert("Error de red");
                          }
                        }}
                      >
                        {invoice.status === "rejected" ? "Reintentar Envío" : "Emitir Factura"}
                      </Button>
                    )}
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
