"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

interface TaskProgressProps {
  taskId: string
  onComplete?: () => void
}

export function TaskProgress({ taskId, onComplete }: TaskProgressProps) {
  const [status, setStatus] = useState<string>("PENDING")
  const [result, setResult] = useState<any>(null)
  
  useEffect(() => {
    if (!taskId) return
    
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`http://localhost:8000/api/v1/bulk/tasks/${taskId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        
        if (res.ok) {
          const data = await res.json()
          setStatus(data.status)
          
          if (data.status === "SUCCESS") {
            setResult(data.result)
            clearInterval(interval)
            if (onComplete) onComplete()
          } else if (data.status === "FAILURE") {
            clearInterval(interval)
          }
        }
      } catch (e) {
        console.error("Error fetching task status", e)
      }
    }, 2000)
    
    return () => clearInterval(interval)
  }, [taskId, onComplete])

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        {status === "PENDING" || status === "STARTED" || status === "PROCESSING" ? (
          <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : status === "SUCCESS" ? (
          <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="h-5 w-5" />
          </div>
        ) : (
          <div className="h-10 w-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <XCircle className="h-5 w-5" />
          </div>
        )}
        
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Procesamiento de Archivo
          </h3>
          <p className="text-sm text-gray-500">
            {status === "PENDING" && "Esperando turno..."}
            {status === "STARTED" && "Iniciando procesamiento..."}
            {status === "PROCESSING" && "Leyendo Excel y generando facturas..."}
            {status === "SUCCESS" && "Procesamiento completado exitosamente."}
            {status === "FAILURE" && "Hubo un error durante el procesamiento."}
          </p>
        </div>
      </div>

      {status === "SUCCESS" && result && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Facturas Creadas</p>
              <p className="text-2xl font-bold text-green-600">{result.created_count || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Errores / Omitidas</p>
              <p className="text-2xl font-bold text-red-600">{result.error_count || 0}</p>
            </div>
          </div>
          {result.errors && result.errors.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Detalle de errores:</p>
              <ul className="text-xs text-red-500 space-y-1 list-disc list-inside max-h-32 overflow-y-auto">
                {result.errors.map((err: any, idx: number) => (
                  <li key={idx}>Fila {err.row}: {err.error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
