"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [error, setError] = useState("")

  // Form states
  const [legalName, setLegalName] = useState("")
  const [cuit, setCuit] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const fetchClients = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    
    try {
      const res = await fetch("http://localhost:8000/api/v1/clients/", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setClients(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const token = localStorage.getItem("token")
    
    try {
      const res = await fetch("http://localhost:8000/api/v1/clients/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          legal_name: legalName,
          cuit: cuit,
          email: email || null,
          phone: phone || null
        })
      })

      if (res.ok) {
        setIsSheetOpen(false)
        fetchClients()
        // Reset form
        setLegalName("")
        setCuit("")
        setEmail("")
        setPhone("")
      } else {
        const err = await res.json()
        setError(err.detail || "Error creating client")
      }
    } catch (e) {
      setError("Network error")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestiona los clientes de tu empresa.</p>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">+ Nuevo Cliente</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Agregar Nuevo Cliente</SheetTitle>
              <SheetDescription>
                Ingresa los datos del cliente para poder facturarle.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleCreateClient} className="space-y-4 mt-6">
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="legalName">Razón Social o Nombre</Label>
                <Input id="legalName" required value={legalName} onChange={(e) => setLegalName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cuit">CUIT / RUT</Label>
                <Input id="cuit" required value={cuit} onChange={(e) => setCuit(e.target.value)} />
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
              <TableHead>CUIT / RUT</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">Cargando clientes...</TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">No hay clientes registrados.</TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.legal_name}</TableCell>
                  <TableCell>{client.cuit}</TableCell>
                  <TableCell>{client.email || "-"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activo
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-indigo-600">Editar</Button>
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
