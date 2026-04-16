import { cn } from "@/lib/cn";
import { IconChevronRight } from "@tabler/icons-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: string[];
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-2">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            {breadcrumb.map((item, index) => (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <IconChevronRight size={12} className="opacity-50" />
                )}
                <span
                  className={cn(
                    index === breadcrumb.length - 1 && "text-[var(--color-text)] font-medium",
                  )}
                >
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight text-[var(--color-text)]">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </header>
  );
}
