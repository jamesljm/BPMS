"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function UomsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: "", name: "" });
  const queryClient = useQueryClient();

  const { data: uoms, isLoading } = useQuery({
    queryKey: ["uoms"],
    queryFn: () => api.get("/uoms").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/uoms", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uoms"] });
      setShowCreate(false);
      setForm({ code: "", name: "" });
      toast.success("UOM created");
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to create UOM"),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Units of Measure</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4 mr-2" /> Add UOM
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <form
              onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}
              className="flex gap-4 items-end"
            >
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Code</label>
                <Input placeholder="e.g. EA, KG, M" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Name</label>
                <Input placeholder="e.g. Each, Kilogram" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Code</th>
                    <th className="text-left p-3 font-medium">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {uoms?.map((uom: any) => (
                    <tr key={uom.id} className="border-b hover:bg-muted/25">
                      <td className="p-3 font-mono font-medium">{uom.code}</td>
                      <td className="p-3">{uom.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
