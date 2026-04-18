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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Power,
  Package,
  Shield,
  Wrench,
  Zap,
  CircleDot,
  Paperclip,
  Gauge,
  Receipt,
  Flame,
  DollarSign,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const categories = ["EQUIPMENT", "MATERIAL", "CONSUMABLE", "TOOL", "SPARE_PART"];
const maintenancePolicies = ["NONE", "PREVENTIVE", "CALIBRATION", "BOTH"];

const categoryColor = (cat: string) => {
  const colors: Record<string, string> = {
    EQUIPMENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    MATERIAL: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    CONSUMABLE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    TOOL: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    SPARE_PART: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  };
  return colors[cat] || "";
};

const tagDefs = [
  { key: "isSerialized", label: "Serialized", icon: CircleDot, color: "text-blue-500" },
  { key: "carriesAttachments", label: "Attachments", icon: Paperclip, color: "text-purple-500" },
  { key: "isOperationalEnabler", label: "Op. Enabler", icon: Zap, color: "text-yellow-500" },
  { key: "receiptRequired", label: "Receipt Req.", icon: Receipt, color: "text-emerald-500" },
  { key: "isBulkConsumable", label: "Bulk", icon: Package, color: "text-orange-500" },
  { key: "isSingleUse", label: "Single Use", icon: Flame, color: "text-red-500" },
  { key: "requiresCertification", label: "Cert. Req.", icon: Shield, color: "text-cyan-500" },
  { key: "isHighValue", label: "High Value", icon: DollarSign, color: "text-green-500" },
] as const;

type StockCodeForm = {
  code: string;
  description: string;
  category: string;
  uomId: string;
  isSerialized: boolean;
  carriesAttachments: boolean;
  isOperationalEnabler: boolean;
  receiptRequired: boolean;
  isBulkConsumable: boolean;
  isSingleUse: boolean;
  maintenancePolicy: string;
  requiresCertification: boolean;
  isHighValue: boolean;
  make: string;
  model: string;
  serialNumber: string;
  assetTag: string;
  yearManufactured: string;
};

const emptyForm: StockCodeForm = {
  code: "",
  description: "",
  category: "EQUIPMENT",
  uomId: "",
  isSerialized: false,
  carriesAttachments: false,
  isOperationalEnabler: false,
  receiptRequired: false,
  isBulkConsumable: false,
  isSingleUse: false,
  maintenancePolicy: "NONE",
  requiresCertification: false,
  isHighValue: false,
  make: "",
  model: "",
  serialNumber: "",
  assetTag: "",
  yearManufactured: "",
};

export default function StockCodesPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<StockCodeForm>(emptyForm);
  const queryClient = useQueryClient();

  // Fetch stock codes
  const { data, isLoading } = useQuery({
    queryKey: ["stock-codes", search, categoryFilter],
    queryFn: () =>
      api
        .get("/stock-codes", {
          params: {
            search: search || undefined,
            category: categoryFilter && categoryFilter !== "ALL" ? categoryFilter : undefined,
            limit: 100,
            sortBy: "code",
            sortOrder: "asc",
          },
        })
        .then((r) => r.data),
  });

  // Fetch UOMs for dropdown
  const { data: uomData } = useQuery({
    queryKey: ["uoms"],
    queryFn: () => api.get("/uoms", { params: { limit: 100 } }).then((r) => r.data),
  });
  const uoms = uomData?.data || [];

  // Create
  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post("/stock-codes", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-codes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setCreateOpen(false);
      setForm(emptyForm);
      toast.success("Stock code created");
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to create"),
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      api.patch(`/stock-codes/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-codes"] });
      setEditOpen(false);
      setEditId(null);
      setForm(emptyForm);
      toast.success("Stock code updated");
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to update"),
  });

  // Deactivate
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/stock-codes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-codes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Stock code deactivated");
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to deactivate"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      description: form.description,
      category: form.category,
      uomId: form.uomId,
      isSerialized: form.isSerialized,
      carriesAttachments: form.carriesAttachments,
      isOperationalEnabler: form.isOperationalEnabler,
      receiptRequired: form.receiptRequired,
      isBulkConsumable: form.isBulkConsumable,
      isSingleUse: form.isSingleUse,
      maintenancePolicy: form.maintenancePolicy,
      requiresCertification: form.requiresCertification,
      isHighValue: form.isHighValue,
    };
    if (form.isSerialized) {
      if (form.make) payload.make = form.make;
      if (form.model) payload.model = form.model;
      if (form.serialNumber) payload.serialNumber = form.serialNumber;
      if (form.assetTag) payload.assetTag = form.assetTag;
      if (form.yearManufactured) payload.yearManufactured = parseInt(form.yearManufactured);
    }
    if (editId) {
      updateMutation.mutate({ id: editId, payload });
    } else {
      payload.code = form.code;
      createMutation.mutate(payload);
    }
  };

  const openEdit = (sc: any) => {
    setEditId(sc.id);
    setForm({
      code: sc.code,
      description: sc.description,
      category: sc.category,
      uomId: sc.uomId,
      isSerialized: sc.isSerialized,
      carriesAttachments: sc.carriesAttachments,
      isOperationalEnabler: sc.isOperationalEnabler,
      receiptRequired: sc.receiptRequired,
      isBulkConsumable: sc.isBulkConsumable,
      isSingleUse: sc.isSingleUse,
      maintenancePolicy: sc.maintenancePolicy,
      requiresCertification: sc.requiresCertification,
      isHighValue: sc.isHighValue,
      make: sc.make || "",
      model: sc.model || "",
      serialNumber: sc.serialNumber || "",
      assetTag: sc.assetTag || "",
      yearManufactured: sc.yearManufactured ? String(sc.yearManufactured) : "",
    });
    setEditOpen(true);
  };

  const activeTags = (sc: any) =>
    tagDefs.filter((t) => sc[t.key]);

  const formDialog = (isEdit: boolean) => (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Code</Label>
          <Input
            placeholder="e.g. EQ-CRANE01"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
            disabled={isEdit}
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>UOM</Label>
          <Select value={form.uomId} onValueChange={(v) => setForm({ ...form, uomId: v })}>
            <SelectTrigger><SelectValue placeholder="Select UOM" /></SelectTrigger>
            <SelectContent>
              {uoms.map((u: any) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.code} - {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="grid grid-cols-2 gap-2">
          {tagDefs.map((t) => (
            <label key={t.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 accent-primary"
                checked={form[t.key as keyof StockCodeForm] as boolean}
                onChange={(e) => setForm({ ...form, [t.key]: e.target.checked })}
              />
              <t.icon className={`h-3.5 w-3.5 ${t.color}`} />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      {/* Maintenance Policy */}
      <div className="space-y-2">
        <Label>Maintenance Policy</Label>
        <Select
          value={form.maintenancePolicy}
          onValueChange={(v) => setForm({ ...form, maintenancePolicy: v })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {maintenancePolicies.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Asset fields (shown when serialized) */}
      {form.isSerialized && (
        <div className="space-y-3 rounded-md border p-3">
          <p className="text-sm font-medium text-muted-foreground">Asset Details (Serialized)</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Make</Label>
              <Input
                placeholder="e.g. Liebherr"
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Model</Label>
              <Input
                placeholder="e.g. LB28"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Serial Number</Label>
              <Input
                placeholder="S/N"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Asset Tag</Label>
              <Input
                placeholder="Asset tag"
                value={form.assetTag}
                onChange={(e) => setForm({ ...form, assetTag: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Year Manufactured</Label>
              <Input
                type="number"
                placeholder="e.g. 2020"
                value={form.yearManufactured}
                onChange={(e) => setForm({ ...form, yearManufactured: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={createMutation.isPending || updateMutation.isPending}
      >
        {(createMutation.isPending || updateMutation.isPending)
          ? (isEdit ? "Updating..." : "Creating...")
          : (isEdit ? "Update Stock Code" : "Create Stock Code")}
      </Button>
    </form>
  );

  return (
    <div className="p-4 lg:p-6 animate-fade-in">
      <PageHeader title="Stock Codes" subtitle="Manage inventory items and categories">
        <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) setForm(emptyForm); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Stock Code</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Stock Code</DialogTitle>
              <DialogDescription>Add a new stock code to the system.</DialogDescription>
            </DialogHeader>
            {formDialog(false)}
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>UOM</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No stock codes found
                    </TableCell>
                  </TableRow>
                )}
                {data?.data?.map((sc: any) => (
                  <TableRow key={sc.id}>
                    <TableCell className="font-mono text-sm font-medium">{sc.code}</TableCell>
                    <TableCell>{sc.description}</TableCell>
                    <TableCell>
                      <Badge className={`${categoryColor(sc.category)} border-0`}>
                        {sc.category.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{sc.uom?.code}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {activeTags(sc).map((t) => (
                          <span key={t.key} title={t.label}>
                            <t.icon className={`h-3.5 w-3.5 ${t.color}`} />
                          </span>
                        ))}
                        {sc.maintenancePolicy !== "NONE" && (
                          <span title={`Maint: ${sc.maintenancePolicy}`}>
                            <Wrench className="h-3.5 w-3.5 text-slate-500" />
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={sc.isActive ? "Active" : "Inactive"} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(sc)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deactivateMutation.mutate(sc.id)}
                          title="Deactivate"
                        >
                          <Power className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setEditId(null); setForm(emptyForm); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Stock Code</DialogTitle>
            <DialogDescription>Update stock code details.</DialogDescription>
          </DialogHeader>
          {formDialog(true)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
