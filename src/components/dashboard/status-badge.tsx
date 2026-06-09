import { Badge } from "@/components/ui/badge";

type Variant = React.ComponentProps<typeof Badge>["variant"];

const MAP: Record<string, Variant> = {
  // RFQ
  OPEN: "success",
  CLOSED: "secondary",
  EXPIRED: "secondary",
  FLAGGED: "warning",
  // Quotation
  PENDING: "warning",
  ACCEPTED: "success",
  REJECTED: "destructive",
  WITHDRAWN: "secondary",
  // Verification
  VERIFIED: "success",
  UNVERIFIED: "secondary",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={MAP[status] ?? "secondary"} className="capitalize">
      {status.toLowerCase()}
    </Badge>
  );
}
