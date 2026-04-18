"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import {
  Users, MapPin, FolderKanban, Package, Layers, ArrowRightLeft, Wrench,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MovementChart } from "@/components/dashboard/MovementChart";
import { StatusPieChart } from "@/components/dashboard/StatusPieChart";
import { RecentMovements } from "@/components/dashboard/RecentMovements";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/dashboard").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "User";
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stats = [
    { label: "Users", value: data?.counts?.users || 0, icon: Users },
    { label: "Places", value: data?.counts?.places || 0, icon: MapPin },
    { label: "Projects", value: data?.counts?.projects || 0, icon: FolderKanban },
    { label: "Stock Codes", value: data?.counts?.stockCodes || 0, icon: Package },
    { label: "Piles", value: data?.counts?.piles || 0, icon: Layers },
    { label: "Movements", value: data?.counts?.movements || 0, icon: ArrowRightLeft },
    { label: "Work Orders", value: data?.counts?.workOrders || 0, icon: Wrench },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">
          {greeting}, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground">{dateStr}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <StatsCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MovementChart />
        <StatusPieChart />
      </div>

      {/* Recent movements */}
      <RecentMovements movements={data?.recentMovements || []} />
    </div>
  );
}
