import Link from "next/link";
import { ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Movement {
  id: string;
  movementNo: string;
  intent: string;
  status: string;
  sourcePlace?: { name: string } | null;
  destPlace?: { name: string } | null;
  createdAt?: string;
}

function statusColor(status: string) {
  switch (status) {
    case "COMPLETED":
    case "RECEIVED":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "IN_TRANSIT":
    case "APPROVED":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "PENDING_APPROVAL":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "DRAFT":
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  }
}

function intentColor(intent: string) {
  switch (intent) {
    case "DISPATCH":
      return "text-blue-600 dark:text-blue-400";
    case "RETURN":
      return "text-emerald-600 dark:text-emerald-400";
    case "SITE_TRANSFER":
      return "text-purple-600 dark:text-purple-400";
    case "WRITE_OFF":
    case "SCRAP":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-muted-foreground";
  }
}

export function RecentMovements({ movements }: { movements: Movement[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Movements</CardTitle>
          <Link href="/movements" className="text-xs text-primary hover:underline">
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No movements yet</p>
        ) : (
          <div className="space-y-3">
            {movements.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary shrink-0">
                  <ArrowRightLeft className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{m.movementNo}</p>
                    <span className={`text-xs font-medium ${intentColor(m.intent)}`}>{m.intent}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {m.sourcePlace?.name || "External"} → {m.destPlace?.name || "External"}
                  </p>
                </div>
                <Badge className={`${statusColor(m.status)} border-0 text-[10px] shrink-0`}>
                  {m.status.replace(/_/g, " ")}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
