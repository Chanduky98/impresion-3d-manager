import { Sidebar } from "@/components/Sidebar"

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>
  )
}
