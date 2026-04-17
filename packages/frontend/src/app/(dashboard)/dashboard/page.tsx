"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, MapPin, FolderKanban, Package, Layers, ArrowRightLeft, Wrench,
} from "lucide-react";

export default function DashboardPage() {
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

  const stats = [
    { name: "Users", value: data?.counts?.users || 0, icon: Users, color: "text-blue-600" },
    { name: "Places", value: data?.counts?.places || 0, icon: MapPin, color: "text-green-600" },
    { name: "Projects", value: data?.counts?.projects || 0, icon: FolderKanban, color: "text-purple-600" },
    { name: "Stock Codes", value: data?.counts?.stockCodes || 0, icon: Package, color: "text-orange-600" },
    { name: "Piles", value: data?.counts?.piles || 0, icon: Layers, color: "text-indigo-600" },
    { name: "Movements", value: data?.counts?.movements || 0, icon: ArrowRightLeft, color: "text-rose-600" },
    { name: "Work Orders", value: data?.counts?.workOrders || 0, icon: Wrench, color: "text-amber-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <p className="text-xs text-muted-foreground">{stat.name}</p>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Movements</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentMovements?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No movements yet</p>
          ) : (
            <div className="space-y-3">
              {data?.recentMovements?.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="text-sm font-medium">{m.movementNo}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.sourcePlace?.name || "External"} → {m.destPlace?.name || "External"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{m.intent}</p>
                    <p className="text-xs text-muted-foreground">{m.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
