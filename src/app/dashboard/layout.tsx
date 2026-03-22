import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#050505] text-white selection:bg-primary/30 selection:text-white pt-[88px]">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-10 relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-[100%] blur-[120px] pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
