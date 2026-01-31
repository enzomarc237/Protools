import { redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { AppSidebar } from "@/components/dashboard/app-sidebar"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar user={session.user} />
      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
