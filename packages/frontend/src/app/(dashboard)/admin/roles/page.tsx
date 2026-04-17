"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RolesPage() {
  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => api.get("/roles").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Roles & Permissions</h1>

      <div className="grid gap-4">
        {roles?.map((role: any) => (
          <Card key={role.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                  {role.isSystem && <Badge variant="secondary">System</Badge>}
                </div>
                <span className="text-sm text-muted-foreground">
                  {role._count?.userRoles || 0} user(s)
                </span>
              </div>
              {role.description && (
                <p className="text-sm text-muted-foreground">{role.description}</p>
              )}
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
