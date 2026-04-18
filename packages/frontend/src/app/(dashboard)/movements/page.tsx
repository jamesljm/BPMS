"use client";

import { ArrowRightLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";

export default function MovementsPage() {
  return (
    <div className="p-4 lg:p-6 animate-fade-in">
      <PageHeader title="Movements" subtitle="Track stock dispatches, returns, and transfers" />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary mb-4">
            <ArrowRightLeft className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Coming Soon</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Unified movement system with dispatch, site transfer, return, write-off, and receipt intents will be available in Phase 4.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
