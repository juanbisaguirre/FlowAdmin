"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  vat_rate: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Form states
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState(0)
  const [vatRate, setVatRate] = useState("21")

  const fetchProducts = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    try {
      const res = await fetch("http://localhost:8000/api/v1/products", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("token")
    try {
      const res = await fetch("http://localhost:8000/api/v1/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          name,
          description,
          price: Number(price),
          vat_rate: Number(vatRate)
        })
      })

      if (res.ok) {
        setIsSheetOpen(false)
        fetchProducts()
        resetForm()
      } else {
        alert("Error creando producto")
      }
    } catch {
      alert("Error de red")
    }
  }

  const resetForm = () => {
    setCode("")
    setName("")
    setDescription("")
    setPrice(0)
    setVatRate("21")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`http://localhost:8000/api/v1/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) fetchProducts()
    } catch {
      alert("Error eliminando")
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Productos y Servicios</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestiona tu catálogo para agilizar la facturación.</p>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={(open) => {
          if (!open) resetForm()
          setIsSheetOpen(open)
        }}>
          <SheetTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700" />}>
            + Nuevo Producto
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Agregar Producto</SheetTitle>
              <SheetDescription>
                Crea un nuevo ítem en tu catálogo.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSave} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="code">Código (Opcional)</Label>
                <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Descripción</Label>
                <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio Neto</Label>
                  <Input id="price" type="number" step="0.01" required value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Tasa de IVA</Label>
                  <Select value={vatRate} onValueChange={(val) => setVatRate(val as string)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="10.5">10.5%</SelectItem>
                      <SelectItem value="21">21%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4">Guardar Producto</Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>IVA</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">Cargando catálogo...</TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">Tu catálogo está vacío.</TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.code || '-'}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-gray-500 text-sm max-w-xs truncate">{product.description}</TableCell>
                  <TableCell>${product.price.toLocaleString('es-AR', {minimumFractionDigits:2})}</TableCell>
                  <TableCell>{product.vat_rate}%</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(product.id)}>
                      Eliminar
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
