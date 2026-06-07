import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-slate-900 dark:text-white mb-4">
          Welcome to <span className="text-indigo-600">FlowAdmin</span>
        </h1>
        
        <p className="mt-4 text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
          The all-in-one management platform for your business. Centralize billing, clients, employees, and more with AI-powered insights.
        </p>

        <div className="flex mt-10 gap-4">
          <Link href="/login">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
              Create an Account
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
