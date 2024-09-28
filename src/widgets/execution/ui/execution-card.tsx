import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function ExecutionCard({
  title,
  items = [],
}: {
  title: string;
  items?: string[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {items.map((item, index) => (
            <div key={index} className="p-2 bg-muted rounded-md">
              {item}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
