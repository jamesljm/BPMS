"use client";

import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";

export default function StockCodesPage() {
  return (
    <div className="p-4 lg:p-6 animate-fade-in">
      <PageHeader title="Stock Codes" subtitle="Manage inventory items and categories" />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary mb-4">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Coming Soon</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Stock code management with 9 classification tags, UOM assignments, and inventory tracking will be available in Phase 2.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
