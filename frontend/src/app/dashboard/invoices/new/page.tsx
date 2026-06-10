"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function NewInvoicePage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<any[]>([])
  
  // Invoice form states
  const [customerId, setCustomerId] = useState("")
  const [invoiceType, setInvoiceType] = useState("C")
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [items, setItems] = useState([{ description: "", quantity: 1, unit_price: 0, tax_rate: 21 }])

  useEffect(() => {
    // Fetch customers for the dropdown
    const fetchCustomers = async () => {
      const token = localStorage.getItem("token")
      if (!token) return
      try {
        const res = await fetch("http://localhost:8000/api/v1/customers/", {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setCustomers(data)
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchCustomers()
  }, [])

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, tax_rate: 21 }])
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSave = async () => {
    const token = localStorage.getItem("token")
    try {
      const res = await fetch("http://localhost:8000/api/v1/invoices/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_id: customerId,
          invoice_type: invoiceType,
          issue_date: issueDate,
          items: items.map(item => ({
            ...item,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            tax_rate: Number(item.tax_rate)
          }))
        })
      })

      if (res.ok) {
        router.push("/dashboard/invoices")
      } else {
        const err = await res.json()
        alert(err.detail || "Error creating invoice")
      }
    } catch (e) {
      alert("Network error")
    }
  }

  // Calculate totals
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)
  const taxes = items.reduce((acc, item) => acc + (item.quantity * item.unit_price * (item.tax_rate / 100)), 0)
  const total = subtotal + taxes

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nueva Factura</h1>
          <p className="text-gray-500 dark:text-gray-400">Crea un borrador de factura para luego emitirla.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Factura</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.business_name} ({c.document_number})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de Comprobante</Label>
              <Select value={invoiceType} onValueChange={setInvoiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Factura A">Factura A</SelectItem>
                  <SelectItem value="Factura B">Factura B</SelectItem>
                  <SelectItem value="Factura C">Factura C</SelectItem>
                  <SelectItem value="Nota de Credito A">Nota de Crédito A</SelectItem>
                  <SelectItem value="Nota de Credito B">Nota de Crédito B</SelectItem>
                  <SelectItem value="Nota de Credito C">Nota de Crédito C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha de Emisión</Label>
              <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Ítems</h3>
              <Button variant="outline" size="sm" onClick={addItem}>+ Agregar Ítem</Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Descripción</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Precio Unitario</TableHead>
                  <TableHead>IVA (%)</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input 
                        value={item.description} 
                        onChange={(e) => updateItem(index, 'description', e.target.value)} 
                        placeholder="Servicio / Producto"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)} 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={item.unit_price} 
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)} 
                      />
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={item.tax_rate.toString()} 
                        onValueChange={(val) => updateItem(index, 'tax_rate', parseFloat(val))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="10.5">10.5%</SelectItem>
                          <SelectItem value="21">21%</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${((item.quantity * item.unit_price) * (1 + item.tax_rate/100)).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mt-8 border-t pt-4">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Impuestos:</span>
                <span className="font-medium">${taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t p-4 bg-gray-50 dark:bg-gray-800/50">
          <Button variant="outline" onClick={() => router.push("/dashboard/invoices")}>Cancelar</Button>
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">Guardar Factura</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
