"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TeamSettingsPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [error, setError] = useState("")

  // Form states
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user")

  const fetchUsers = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    
    try {
      const res = await fetch("http://localhost:8000/api/v1/team", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      } else if (res.status === 403) {
        setError("No tienes permisos para ver el equipo. Se requiere rol de Admin.")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const token = localStorage.getItem("token")
    
    try {
      const res = await fetch(`http://localhost:8000/api/v1/team?role=${role}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      })

      if (res.ok) {
        setIsSheetOpen(false)
        fetchUsers()
        resetForm()
      } else {
        const err = await res.json()
        setError(err.detail || "Error al invitar usuario")
      }
    } catch (e) {
      setError("Error de red")
    }
  }

  const resetForm = () => {
    setName("")
    setEmail("")
    setPassword("")
    setRole("user")
    setError("")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas revocar el acceso de este usuario?")) return;
    
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`http://localhost:8000/api/v1/team/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        fetchUsers()
      } else {
        const err = await res.json()
        alert(err.detail || "Error eliminando usuario")
      }
    } catch (e) {
      alert("Error de red")
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Equipo</h1>
          <p className="text-gray-500 dark:text-gray-400">Administra los accesos y roles de tu personal.</p>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={(open) => {
          if (!open) resetForm()
          setIsSheetOpen(open)
        }}>
          <SheetTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700" />}>
            + Invitar Miembro
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Invitar al Equipo</SheetTitle>
              <SheetDescription>
                Agrega un nuevo usuario a tu organización GestionApp.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleInvite} className="space-y-4 mt-6">
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña Inicial</Label>
                <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                <p className="text-xs text-gray-500">El usuario podrá cambiarla luego (Mínimo 8 caracteres).</p>
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={role} onValueChange={(val) => setRole(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Cajero / Operador (User)</SelectItem>
                    <SelectItem value="admin">Administrador (Admin)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4">Enviar Invitación</Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {error && !isSheetOpen && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">Cargando equipo...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">No se encontraron miembros.</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activo
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50" 
                      onClick={() => handleDelete(user.id)}
                    >
                      Revocar Acceso
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
