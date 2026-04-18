"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const placeTypes = ["PROJECT", "WAREHOUSE", "WORKSHOP", "YARD", "VENDOR", "SCRAP"];

const typeColor = (type: string) => {
  const colors: Record<string, string> = {
    PROJECT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    WAREHOUSE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    WORKSHOP: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    YARD: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    VENDOR: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    SCRAP: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return colors[type] || "";
};

export default function PlacesPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
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
      setOpen(false);
      setForm({ code: "", name: "", type: "WAREHOUSE", address: "" });
      toast.success("Place created");
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to create place"),
  });

  return (
    <div className="p-4 lg:p-6 animate-fade-in">
      <PageHeader title="Places" subtitle="Manage warehouses, yards, and project sites">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Place
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Place</DialogTitle>
              <DialogDescription>Add a new location to the system.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input placeholder="e.g. HQ-WH" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {placeTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input placeholder="Address (optional)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Place"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search places..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data?.map((place: any) => (
            <Card key={place.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-mono text-sm font-medium">{place.code}</span>
                  </div>
                  <Badge className={`${typeColor(place.type)} border-0`}>{place.type}</Badge>
                </div>
                <p className="font-medium">{place.name}</p>
                {place.address && (
                  <p className="text-xs text-muted-foreground mt-1">{place.address}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <StatusBadge status={place.isActive ? "Active" : "Inactive"} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
