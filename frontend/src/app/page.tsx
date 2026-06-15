import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bot, Zap, Shield, FileSpreadsheet, BarChart3, CheckCircle2 } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950 font-sans">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">FlowAdmin</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">Características</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">Cómo Funciona</Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">Precios</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 dark:text-gray-300">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6">Empezar Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-white dark:from-indigo-900/20 dark:via-gray-950 dark:to-gray-950 -z-10"></div>
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="inline-flex items-center rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span>
              FlowAdmin v2.0 ya está disponible
            </div>
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-7xl mb-6">
              Facturación Inteligente con <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Cero Fricción</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
              Automatiza la emisión de facturas electrónicas, gestiona a tus clientes y envía PDFs automáticamente con el poder de la Inteligencia Artificial.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-14 text-lg">
                  Comienza tu prueba gratis <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-14 text-lg border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900">
                  Ver Características
                </Button>
              </Link>
            </div>
            
            {/* Dashboard Mockup Image */}
            <div className="mx-auto mt-16 max-w-5xl rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 p-2 shadow-2xl backdrop-blur-sm">
              <div className="rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 aspect-[16/9] flex items-center justify-center relative">
                 {/* Decorative elements representing UI */}
                 <div className="absolute top-4 left-4 right-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
                    <div className="w-32 h-6 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="flex gap-2">
                       <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                       <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full"></div>
                    </div>
                 </div>
                 <div className="grid grid-cols-4 gap-4 w-full px-4 mt-16">
                    <div className="h-24 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                       <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                       <div className="w-3/4 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded"></div>
                    </div>
                    <div className="h-24 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                       <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                       <div className="w-3/4 h-8 bg-gray-100 dark:bg-gray-800 rounded"></div>
                    </div>
                    <div className="h-24 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                       <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                       <div className="w-3/4 h-8 bg-gray-100 dark:bg-gray-800 rounded"></div>
                    </div>
                    <div className="h-24 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                       <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                       <div className="w-3/4 h-8 bg-gray-100 dark:bg-gray-800 rounded"></div>
                    </div>
                 </div>
                 {/* Play button overlay */}
                 <div className="absolute inset-0 flex items-center justify-center bg-gray-900/5 dark:bg-black/20 group cursor-pointer transition-all">
                    <div className="h-16 w-16 rounded-full bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                       <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-indigo-600 border-b-8 border-b-transparent ml-1"></div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Todo lo que necesitas para tu administración</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">FlowAdmin fue diseñado pensando en la velocidad y la eficiencia. Deja que la tecnología haga el trabajo pesado.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Asistente de IA Integrado</h3>
                <p className="text-gray-600 dark:text-gray-400">Dale comandos en lenguaje natural a tu plataforma. "Emite las facturas de abril" y el asistente orquestará todo en segundo plano.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-6">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Carga Masiva (Excel)</h3>
                <p className="text-gray-600 dark:text-gray-400">Procesa cientos de facturas en segundos. Sube un archivo Excel y nuestro sistema de colas lo procesará sin bloquear tu pantalla.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Métricas en Tiempo Real</h3>
                <p className="text-gray-600 dark:text-gray-400">Dashboard dinámico con gráficos interactivos para seguir de cerca los ingresos, clientes activos y facturas emitidas de tu negocio.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="how-it-works" className="py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-6">Flujo de trabajo automatizado</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  Olvídate de procesos manuales. Cuando apruebas una factura, nuestro sistema se encarga del resto.
                </p>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Conexión AFIP/SII</h4>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">Integramos directamente con los entes gubernamentales a través de proveedores certificados.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Generación de PDF</h4>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">Una vez obtenido el CAE, creamos automáticamente un PDF profesional con el diseño de tu marca.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Envío por Email</h4>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">Tu cliente recibe instantáneamente la factura en su bandeja de entrada. Cero fricción operativa.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="lg:w-1/2 w-full">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-800">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /></div>
                      <div>
                         <p className="font-semibold text-gray-900 dark:text-white">Factura #001-452 Emitida</p>
                         <p className="text-sm text-gray-500">CAE: 84930284759021</p>
                      </div>
                    </div>
                    <div className="w-full h-px bg-gray-100 dark:bg-gray-800"></div>
                    <div className="flex items-center gap-4 opacity-75">
                      <div className="h-10 w-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center"><FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" /></div>
                      <div>
                         <p className="font-semibold text-gray-900 dark:text-white">PDF Generado</p>
                         <p className="text-sm text-gray-500">Almacenado en la nube de forma segura</p>
                      </div>
                    </div>
                    <div className="w-full h-px bg-gray-100 dark:bg-gray-800"></div>
                    <div className="flex items-center gap-4 opacity-50">
                      <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center"><Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
                      <div>
                         <p className="font-semibold text-gray-900 dark:text-white">Email Enviado a Cliente</p>
                         <p className="text-sm text-gray-500">juan@cliente.com • Hace 2 seg</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-indigo-600 dark:bg-indigo-900">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">¿Listo para escalar tu negocio?</h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">Únete a cientos de empresas que ya están automatizando su administración con FlowAdmin.</p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 hover:text-indigo-700 rounded-full px-8 h-14 text-lg shadow-lg">
                Crear una cuenta gratis
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-950 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">FlowAdmin</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">© {new Date().getFullYear()} FlowAdmin Inc. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">Términos</Link>
            <Link href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
