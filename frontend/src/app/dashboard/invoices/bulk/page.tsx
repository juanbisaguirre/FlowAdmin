"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, UploadCloud, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskProgress } from "@/components/ui/TaskProgress"

export default function BulkUploadPage() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (selectedFile: File) => {
    if (selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls")) {
      setFile(selectedFile)
    } else {
      alert("Por favor, sube un archivo Excel (.xlsx o .xls)")
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:8000/api/v1/bulk/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setTaskId(data.task_id)
      } else {
        alert("Error al subir el archivo")
      }
    } catch (e) {
      alert("Error de red")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/invoices">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Carga Masiva de Facturas</h1>
          <p className="text-gray-500 dark:text-gray-400">Sube un archivo Excel para generar múltiples facturas en lote.</p>
        </div>
      </div>

      {!taskId ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <form 
            onDragEnter={handleDrag} 
            onDragLeave={handleDrag} 
            onDragOver={handleDrag} 
            onDrop={handleDrop}
            onSubmit={(e) => e.preventDefault()}
            className={`mt-2 flex justify-center rounded-xl border-2 border-dashed px-6 pt-10 pb-12 transition-colors ${
              dragActive 
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" 
                : "border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500"
            }`}
          >
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                {file ? (
                  <FileSpreadsheet className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <UploadCloud className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              
              <div className="flex justify-center text-sm leading-6 text-gray-600 dark:text-gray-300">
                {file ? (
                  <p className="font-medium text-indigo-600 dark:text-indigo-400">{file.name}</p>
                ) : (
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    <span>Sube un archivo</span>
                    <input id="file-upload" name="file-upload" type="file" accept=".xlsx, .xls" className="sr-only" ref={inputRef} onChange={handleChange} />
                  </label>
                )}
                {!file && <p className="pl-1">o arrástralo y suéltalo aquí</p>}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Excel (.xlsx) hasta 10MB</p>
            </div>
          </form>

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setFile(null)} disabled={!file || isUploading}>
              Cancelar
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? "Subiendo..." : "Procesar Archivo"}
            </Button>
          </div>
        </div>
      ) : (
        <TaskProgress taskId={taskId} />
      )}
      
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
        <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Formato esperado del Excel</h4>
        <p className="text-sm text-indigo-700 dark:text-indigo-400">
          Asegúrate de que la primera fila contenga los siguientes encabezados (en minúsculas):
          <br/><br/>
          <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">document_number</code>, 
          <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs ml-2">invoice_type</code>, 
          <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs ml-2">issue_date</code>, 
          <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs ml-2">due_date</code>, 
          <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs ml-2">description</code>, 
          <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs ml-2">quantity</code>, 
          <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs ml-2">unit_price</code>, 
          <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs ml-2">tax_rate</code>
        </p>
      </div>
    </div>
  )
}
