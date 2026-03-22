"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/hooks/use-user";
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  BarChart3,
  Users,
  Star,
  Ticket,
  QrCode,
  Music,
  Briefcase,
  Heart,
  Shield,
  Settings,
  Sparkles,
} from "lucide-react";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const sidebarLinks: Record<string, SidebarLink[]> = {
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/dashboard/admin", label: "All Events", icon: <Calendar className="h-4 w-4" /> },
    { href: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { href: "/dashboard/analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { href: "/admin/reviews", label: "Reviews", icon: <Star className="h-4 w-4" /> },
    { href: "/admin/sponsors", label: "Sponsors", icon: <Briefcase className="h-4 w-4" /> },
    { href: "/admin/settings", label: "Settings", icon: <Shield className="h-4 w-4" /> },
  ],
  organizer: [
    { href: "/dashboard/organizer", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/dashboard/organizer", label: "My Events", icon: <Calendar className="h-4 w-4" /> },
    { href: "/events/create", label: "Create Event", icon: <PlusCircle className="h-4 w-4" /> },
    { href: "/dashboard/analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { href: "/dashboard/organizer/check-in", label: "QR Check-in", icon: <QrCode className="h-4 w-4" /> },
  ],
  artist: [
    { href: "/dashboard/artist", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/dashboard/artist", label: "My Portfolio", icon: <Music className="h-4 w-4" /> },
    { href: "/dashboard/artist", label: "Upcoming Gigs", icon: <Calendar className="h-4 w-4" /> },
    { href: "/dashboard/artist", label: "Invitations", icon: <Heart className="h-4 w-4" /> },
  ],
  attendee: [
    { href: "/dashboard/attendee", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/dashboard/attendee", label: "My Bookings", icon: <Ticket className="h-4 w-4" /> },
    { href: "/events", label: "Browse Events", icon: <Calendar className="h-4 w-4" /> },
  ],
};

export function Sidebar() {
  const { data: user } = useUser();
  const pathname = usePathname();

  if (!user) return null;

  const links = sidebarLinks[user.role] || sidebarLinks.attendee;

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-gray-800 bg-[#0A0D15] p-6 z-20">
      {/* Dashboard Header */}
      <div className="mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(255,0,122,0.2)]">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-primary">{user.role} Panel</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{user.name || user.email?.split('@')[0]}</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-2 flex-1">
        {links.map((link, index) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={`${link.href}-${index}`}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all ${
                isActive
                  ? "bg-primary text-black shadow-[0_0_20px_rgba(255,0,122,0.2)]"
                  : "text-gray-400 hover:text-white hover:bg-[#111] hover:border-gray-800 border border-transparent"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Settings */}
      <div className="border-t border-gray-800 pt-6 mt-6">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 hover:text-white hover:bg-[#111] transition-colors"
        >
          <Settings className="h-4 w-4" />
          System Config
        </Link>
      </div>
    </aside>
  );
}
