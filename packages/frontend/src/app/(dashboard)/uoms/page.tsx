"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function UomsPage() {
  const [open, setOpen] = useState(false);
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
      setOpen(false);
      setForm({ code: "", name: "" });
      toast.success("UOM created");
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to create UOM"),
  });

  return (
    <div className="p-4 lg:p-6 animate-fade-in">
      <PageHeader title="Units of Measure" subtitle="Manage measurement units for stock codes">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add UOM
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Unit of Measure</DialogTitle>
              <DialogDescription>Add a new UOM to the system.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Code</Label>
                <Input placeholder="e.g. EA, KG, M" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="e.g. Each, Kilogram" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create UOM"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uoms?.map((uom: any) => (
                  <TableRow key={uom.id}>
                    <TableCell className="font-mono font-medium">{uom.code}</TableCell>
                    <TableCell>{uom.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
