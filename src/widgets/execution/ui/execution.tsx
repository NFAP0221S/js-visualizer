import { useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ExecutionCard } from "./execution-card";
import { ExecutionContext } from "@/app/context/execution-context";

export function Execution() {
  const { state } = useContext(ExecutionContext);
  const { callStack, eventLoop, taskQueue, microtaskQueue, memoryUsage, executionTime } = state;

  return (
    <div className="lg:col-span-1 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Execution Context</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ExecutionCard
            title="Call Stack"
            items={callStack}
          />
          <ExecutionCard title="Event Loop" items={eventLoop} />
          <ExecutionCard
            title="Task Queue"
            items={taskQueue}
          />
          <ExecutionCard
            title="Microtask Queue"
            items={microtaskQueue}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <span>Memory Usage: {memoryUsage}</span>
            <span>Execution Time: {executionTime}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
