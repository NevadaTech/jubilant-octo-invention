import { PageHeader } from "@/modules/preview";
import { Button, Card } from "@/ui/components";

export interface CatalogNameListItem {
  name: string;
  detail?: string;
}

export function CatalogNameList({
  title,
  actionLabel,
  items,
  context,
}: {
  title: string;
  actionLabel: string;
  items: readonly CatalogNameListItem[];
  context?: string;
}) {
  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        action={<Button type="button">{actionLabel}</Button>}
      />
      {context ? (
        <p className="text-sm text-muted-foreground">{context}</p>
      ) : null}
      <Card className="shadow-none">
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li
              key={item.name}
              className="flex items-center justify-between gap-4 px-6 py-3"
            >
              <span className="text-sm font-semibold text-foreground">
                {item.name}
              </span>
              {item.detail ? (
                <span className="text-sm text-muted-foreground">
                  {item.detail}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
