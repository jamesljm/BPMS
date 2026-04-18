"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function RolesPage() {
  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => api.get("/roles").then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-4 lg:p-6 animate-fade-in">
      <PageHeader title="Roles & Permissions" subtitle="System roles and their access levels" />

      <div className="grid gap-4">
        {roles?.map((role: any) => (
          <Card key={role.id} className="hover:shadow-sm transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    {role.description && (
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {role.isSystem && <StatusBadge status="System" />}
                  <span className="text-sm text-muted-foreground">
                    {role._count?.userRoles || 0} user(s)
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {role.permissions?.map((p: any) => (
                  <Badge key={p.id} variant="outline" className="text-xs">
                    {p.resource}.{p.action} ({p.scope})
                  </Badge>
                ))}
                {role.permissions?.length === 0 && (
                  <p className="text-sm text-muted-foreground">No permissions set</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
