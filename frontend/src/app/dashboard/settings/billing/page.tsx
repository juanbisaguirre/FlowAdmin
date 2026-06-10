"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function BillingSettingsPage() {
  const [provider, setProvider] = useState("TusFacturas")
  const [apikey, setApikey] = useState("")
  const [apitoken, setApitoken] = useState("")
  const [usertoken, setUsertoken] = useState("")
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  const fetchStatus = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    
    try {
      const res = await fetch("http://localhost:8000/api/v1/billing-settings", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg("")
    
    const token = localStorage.getItem("token")
    try {
      const res = await fetch("http://localhost:8000/api/v1/billing-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          provider,
          apikey,
          apitoken,
          usertoken
        })
      })

      if (res.ok) {
        setMsg("Credenciales guardadas correctamente.")
        setApikey("")
        setApitoken("")
        setUsertoken("")
        fetchStatus()
      } else {
        const err = await res.json()
        setMsg(err.detail || "Error guardando credenciales.")
      }
    } catch (e) {
      setMsg("Error de red.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración de Facturación</h1>
        <p className="text-gray-500 dark:text-gray-400">Administra las credenciales para la facturación electrónica.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credenciales de TusFacturasAPP</CardTitle>
          <CardDescription>
            Ingresa las credenciales provistas por TusFacturas para habilitar la emisión automática. 
            Las contraseñas se almacenan cifradas (AES-256) en la base de datos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <h3 className="font-medium text-sm mb-2">Estado Actual:</h3>
              <ul className="text-sm space-y-1">
                <li>Proveedor: <strong>{status.provider}</strong></li>
                <li>API Key: {status.has_apikey ? <span className="text-green-600">Configurada</span> : <span className="text-red-500">Falta</span>}</li>
                <li>API Token: {status.has_apitoken ? <span className="text-green-600">Configurado</span> : <span className="text-red-500">Falta</span>}</li>
                <li>User Token: {status.has_usertoken ? <span className="text-green-600">Configurado</span> : <span className="text-red-500">Falta</span>}</li>
              </ul>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            {msg && (
              <div className={`p-3 rounded-md text-sm ${msg.includes("Error") ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
                {msg}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="apikey">API Key</Label>
              <Input 
                id="apikey" 
                type="password" 
                required 
                value={apikey} 
                onChange={(e) => setApikey(e.target.value)} 
                placeholder="Ingresa tu API Key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apitoken">API Token</Label>
              <Input 
                id="apitoken" 
                type="password" 
                required 
                value={apitoken} 
                onChange={(e) => setApitoken(e.target.value)} 
                placeholder="Ingresa tu API Token"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usertoken">User Token</Label>
              <Input 
                id="usertoken" 
                type="password" 
                required 
                value={usertoken} 
                onChange={(e) => setUsertoken(e.target.value)} 
                placeholder="Ingresa tu User Token"
              />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Credenciales"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
