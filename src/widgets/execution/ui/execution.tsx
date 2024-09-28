import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ExecutionCard } from "./execution-card";

export function Execution() {
  return (
    <div className="lg:col-span-1 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Execution Context</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ExecutionCard
            title="Call Stack"
            items={["main()", "function1()", "function2()"]}
          />
          <ExecutionCard title="Event Loop" items={["Processing..."]} />
          <ExecutionCard
            title="Task Queue"
            items={["setTimeout()", "setInterval()"]}
          />
          <ExecutionCard
            title="Microtask Queue"
            items={["Promise.resolve()", "process.nextTick()"]}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <span>Memory Usage: 45.32%</span>
            <span>Execution Time: 0.23s</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
