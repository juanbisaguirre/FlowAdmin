"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Customer {
  id: string;
  business_name: string;
  document_type: string;
  document_number: string;
  vat_condition: string;
  email: string;
  phone: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form states
  const [businessName, setBusinessName] = useState("")
  const [documentType, setDocumentType] = useState("CUIT")
  const [documentNumber, setDocumentNumber] = useState("")
  const [vatCondition, setVatCondition] = useState("Responsable Inscripto")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const fetchCustomers = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    
    try {
      const res = await fetch("http://localhost:8000/api/v1/customers/", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const token = localStorage.getItem("token")
    
    try {
      const url = editingId 
        ? `http://localhost:8000/api/v1/customers/${editingId}` 
        : "http://localhost:8000/api/v1/customers/"
        
      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          business_name: businessName,
          document_type: documentType,
          document_number: documentNumber,
          vat_condition: vatCondition,
          email: email || null,
          phone: phone || null
        })
      })

      if (res.ok) {
        setIsSheetOpen(false)
        fetchCustomers()
        resetForm()
      } else {
        const err = await res.json()
        setError(err.detail || "Error saving customer")
      }
    } catch {
      setError("Network error")
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setBusinessName("")
    setDocumentType("CUIT")
    setDocumentNumber("")
    setVatCondition("Responsable Inscripto")
    setEmail("")
    setPhone("")
    setError("")
  }

  const openNewCustomer = () => {
    resetForm()
    setIsSheetOpen(true)
  }

  const handleEditClick = (customer: Customer) => {
    setEditingId(customer.id)
    setBusinessName(customer.business_name)
    setDocumentType(customer.document_type || "CUIT")
    setDocumentNumber(customer.document_number)
    setVatCondition(customer.vat_condition || "Responsable Inscripto")
    setEmail(customer.email || "")
    setPhone(customer.phone || "")
    setError("")
    setIsSheetOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente?")) return;
    
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`http://localhost:8000/api/v1/customers/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        fetchCustomers()
      } else {
        alert("Error eliminando cliente")
      }
    } catch {
      alert("Error de red")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestiona los clientes de tu empresa.</p>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={(open) => {
          if (!open) resetForm()
          setIsSheetOpen(open)
        }}>
          <SheetTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700" onClick={openNewCustomer} />}>
            + Nuevo Cliente
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{editingId ? "Editar Cliente" : "Agregar Nuevo Cliente"}</SheetTitle>
              <SheetDescription>
                {editingId ? "Modifica los datos del cliente." : "Ingresa los datos del cliente para facturación electrónica."}
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSaveCustomer} className="space-y-4 mt-6">
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="businessName">Razón Social</Label>
                <Input id="businessName" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                  <Label>Tipo Doc.</Label>
                  <Select value={documentType} onValueChange={(val) => setDocumentType(val as string)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUIT">CUIT</SelectItem>
                      <SelectItem value="DNI">DNI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="documentNumber">Número</Label>
                  <Input id="documentNumber" required value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Condición frente al IVA</Label>
                <Select value={vatCondition} onValueChange={(val) => setVatCondition(val as string)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Responsable Inscripto">Responsable Inscripto</SelectItem>
                    <SelectItem value="Monotributista">Monotributista</SelectItem>
                    <SelectItem value="Exento">Exento</SelectItem>
                    <SelectItem value="Consumidor Final">Consumidor Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4">Guardar Cliente</Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razón Social</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Condición IVA</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">Cargando clientes...</TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">No hay clientes registrados.</TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.business_name}</TableCell>
                  <TableCell>{customer.document_type} {customer.document_number}</TableCell>
                  <TableCell>{customer.vat_condition}</TableCell>
                  <TableCell>{customer.email || "-"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" className="text-indigo-600" onClick={() => handleEditClick(customer)}>Editar</Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(customer.id)}>Eliminar</Button>
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
