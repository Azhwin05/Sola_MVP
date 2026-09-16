import { Sun } from "lucide-react";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
            <Sun className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">{children}</div>
        {footer && <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
