import { Sidebar } from "@/components/layout";
import { Header } from "@/components/layout";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 min-h-[calc(100vh-4rem)]">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
