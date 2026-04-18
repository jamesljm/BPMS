"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MapPin, FolderKanban, Package, ArrowRightLeft,
  Wrench, Shield, Ruler, Users, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Places", href: "/places", icon: MapPin },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Stock", href: "/stock-codes", icon: Package },
  { name: "Moves", href: "/movements", icon: ArrowRightLeft },
  { name: "Maint.", href: "/maintenance", icon: Wrench },
  { name: "Approvals", href: "/approvals", icon: Shield },
  { name: "UOMs", href: "/uoms", icon: Ruler },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Roles", href: "/admin/roles", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex overflow-x-auto scrollbar-hide px-2 py-1.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[56px] px-2 py-1 rounded-lg text-xs transition-colors shrink-0",
                isActive
                  ? "bg-accent text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-0.5", isActive && "text-primary")} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
