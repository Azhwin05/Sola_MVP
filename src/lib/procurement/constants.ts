export const RFQ_STATUSES = ["draft", "sent", "quotes_received", "awarded", "cancelled"] as const;
export type RfqStatus = (typeof RFQ_STATUSES)[number];

export const RFQ_STATUS_LABELS: Record<RfqStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  quotes_received: "Quotes received",
  awarded: "Awarded",
  cancelled: "Cancelled",
};

export const RFQ_VENDOR_STATUSES = ["invited", "quoted", "declined"] as const;
export type RfqVendorStatus = (typeof RFQ_VENDOR_STATUSES)[number];

export const QUOTE_STATUSES = ["submitted", "selected", "rejected"] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];
