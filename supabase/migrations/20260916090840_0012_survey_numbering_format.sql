alter table public.system_settings
  alter column numbering_formats set default '{
    "lead": "LEAD-{YYYY}-{SEQ:4}",
    "survey": "SRV-{YYYY}-{SEQ:4}",
    "project": "SOL-{YYYY}-{SEQ:4}",
    "proposal": "PROP-{YYYY}-{SEQ:4}",
    "purchase_order": "PO-{YYYY}-{SEQ:4}",
    "invoice": "INV-{YYYY}-{SEQ:4}",
    "grn": "GRN-{YYYY}-{SEQ:4}",
    "service_ticket": "SR-{YYYY}-{SEQ:4}"
  }'::jsonb;

-- Backfill any existing org rows that predate the "survey" key
update public.system_settings
set numbering_formats = numbering_formats || '{"survey": "SRV-{YYYY}-{SEQ:4}"}'::jsonb
where not (numbering_formats ? 'survey');
