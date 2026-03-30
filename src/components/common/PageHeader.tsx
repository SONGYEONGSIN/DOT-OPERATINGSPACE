import { cn } from "@/lib/cn";

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
          <ol className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            {breadcrumb.map((item, index) => (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span className="material-symbols-outlined text-[10px] opacity-50">
                    chevron_right
                  </span>
                )}
                <span
                  className={cn(
                    index === breadcrumb.length - 1 && "text-on-surface font-medium",
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
          <h1 className="text-3xl font-black tracking-tight text-on-surface">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-on-surface-variant">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </header>
  );
}
