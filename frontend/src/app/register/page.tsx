"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function RegisterPage() {
  const [tenantName, setTenantName] = useState("")
  const [tenantCuit, setTenantCuit] = useState("")
  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenant_name: tenantName,
          tenant_cuit: tenantCuit,
          user_name: userName,
          email: email,
          password: password,
        }),
      })

      if (response.ok) {
        // Automatically redirect to login after successful registration
        router.push("/login?registered=true")
      } else {
        const errData = await response.json()
        setError(errData.detail || "Error registering")
      }
    } catch (err) {
      setError("Network error")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900 py-12">
      <Card className="w-full max-w-lg shadow-lg border-t-4 border-t-indigo-600">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Create Account</CardTitle>
          <CardDescription>
            Register your company on GestionApp
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-4 rounded-md border p-4 bg-gray-50/50">
              <h3 className="font-medium text-sm text-gray-700">Company Information</h3>
              <div className="space-y-2">
                <Label htmlFor="tenantName">Company Name (Razón Social)</Label>
                <Input 
                  id="tenantName" 
                  placeholder="Acme Corp" 
                  required 
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenantCuit">CUIT / RUT</Label>
                <Input 
                  id="tenantCuit" 
                  placeholder="30-12345678-9" 
                  required 
                  value={tenantCuit}
                  onChange={(e) => setTenantCuit(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-md border p-4 bg-gray-50/50">
              <h3 className="font-medium text-sm text-gray-700">Admin User</h3>
              <div className="space-y-2">
                <Label htmlFor="userName">Your Full Name</Label>
                <Input 
                  id="userName" 
                  placeholder="John Doe" 
                  required 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Create Account</Button>
            <div className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
