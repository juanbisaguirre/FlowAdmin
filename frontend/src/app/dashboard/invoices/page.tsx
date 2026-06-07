"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInvoices = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    
    try {
      const res = await fetch("http://localhost:8000/api/v1/invoices/", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setInvoices(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Facturación</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestiona tus facturas y comprobantes emitidos.</p>
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
                  <TableCell>{invoice.client_id} {/* TODO: fetch client name */}</TableCell>
                  <TableCell>Factura {invoice.invoice_type}</TableCell>
                  <TableCell>${invoice.total_amount}</TableCell>
                  <TableCell>
                    {invoice.status === "draft" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Borrador</span>
                    )}
                    {invoice.status === "sent" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Emitida</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" className="text-indigo-600">Ver</Button>
                    {invoice.status === "draft" && (
                      <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">Emitir a AFIP</Button>
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
