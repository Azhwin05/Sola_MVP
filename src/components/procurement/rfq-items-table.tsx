import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { RfqItemRow } from "@/components/procurement/types";

export function RfqItemsTable({ items }: { items: RfqItemRow[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No equipment lines on this RFQ.</p>;
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Specification</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>Unit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium text-foreground">{item.item}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{item.specification || "—"}</TableCell>
              <TableCell className="text-right text-sm tabular-nums text-foreground">
                {Number(item.quantity).toLocaleString("en-IN")}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{item.unit}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
