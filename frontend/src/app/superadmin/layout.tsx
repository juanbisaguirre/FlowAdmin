import Link from "next/link"

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Special Red/Dark Theme for God Mode */}
      <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 hidden md:block">
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-800">
            <span className="text-xl font-bold text-red-500 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              God Mode
            </span>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            <Link href="/superadmin" className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-red-500/10 text-red-400">
              Panel Maestro
            </Link>
          </nav>
          <div className="p-4 border-t border-gray-800">
            <Link href="/login" className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
              Salir de Matrix
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center md:hidden">
            <span className="text-xl font-bold text-red-500">God Mode</span>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">SuperAdmin</span>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
              SA
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
