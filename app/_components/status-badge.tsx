import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  active: "bg-success/12 text-success border-success/30",
  pass: "bg-success/12 text-success border-success/30",
  approved: "bg-success/12 text-success border-success/30",
  committed: "bg-success/12 text-success border-success/30",
  validated: "bg-info/12 text-info border-info/30",
  "in review": "bg-info/12 text-info border-info/30",
  pending: "bg-warning/18 text-warning-foreground border-warning/40",
  missing: "bg-warning/18 text-warning-foreground border-warning/40",
  "field capture": "bg-warning/18 text-warning-foreground border-warning/40",
  suspended: "bg-destructive/12 text-destructive border-destructive/30",
  flagged: "bg-destructive/12 text-destructive border-destructive/30",
  rejected: "bg-destructive/12 text-destructive border-destructive/30",
  failed: "bg-destructive/12 text-destructive border-destructive/30",
  inactive: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium rounded-sm",
        tone[value.toLowerCase()] ??
          "bg-muted text-muted-foreground rounded-sm",
        className,
      )}
    >
      {value}
    </Badge>
  );
}
