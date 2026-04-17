"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Search, MapPin } from "lucide-react";

const placeTypes = ["PROJECT", "WAREHOUSE", "WORKSHOP", "YARD", "VENDOR", "SCRAP"];

export default function PlacesPage() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", type: "WAREHOUSE", address: "" });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["places", search],
    queryFn: () => api.get("/places", { params: { search, limit: 50 } }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/places", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      setShowCreate(false);
      setForm({ code: "", name: "", type: "WAREHOUSE", address: "" });
      toast.success("Place created");
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to create place"),
  });

  const typeColor = (type: string) => {
    const colors: Record<string, string> = {
      PROJECT: "bg-blue-100 text-blue-700",
      WAREHOUSE: "bg-green-100 text-green-700",
      WORKSHOP: "bg-amber-100 text-amber-700",
      YARD: "bg-purple-100 text-purple-700",
      VENDOR: "bg-pink-100 text-pink-700",
      SCRAP: "bg-red-100 text-red-700",
    };
    return colors[type] || "";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Places</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4 mr-2" /> Add Place
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-lg">Create Place</CardTitle></CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <Input placeholder="Code (e.g. HQ-WH)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {placeTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <Input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <div className="md:col-span-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search places..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          data?.data?.map((place: any) => (
            <Card key={place.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm font-medium">{place.code}</span>
                  </div>
                  <Badge className={typeColor(place.type)}>{place.type}</Badge>
                </div>
                <p className="font-medium">{place.name}</p>
                {place.address && (
                  <p className="text-xs text-muted-foreground mt-1">{place.address}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={place.isActive ? "default" : "destructive"} className="text-xs">
                    {place.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
