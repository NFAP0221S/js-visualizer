import { useContext, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ExecutionCard } from "./execution-card";
import { ExecutionContext } from "@/app/context/execution-context";

export function Execution() {
  const { state } = useContext(ExecutionContext);
  const {
    callStack,
    eventLoop,
    taskQueue,
    microtaskQueue,
    phase,
  } = state;

  useEffect(() => {
    console.log('### callStack:', callStack);
    console.log('### eventLoop:', eventLoop);
    console.log('### taskQueue:', taskQueue);
    console.log('### microtaskQueue:', microtaskQueue);
  }, [callStack, eventLoop, taskQueue, microtaskQueue]);

  return (
    <div className="lg:col-span-1 space-y-6">
      {/* 실행 컨텍스트 박스 */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Context</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 왼쪽: 콜 스택 */}
          <ExecutionCard title="Call Stack" items={callStack} />
          
          {/* 오른쪽: 태스크 큐와 마이크로태스크 큐 */}
          <div className="grid grid-cols-1 gap-4">
            <ExecutionCard title="Task Queue" items={taskQueue} />
            <ExecutionCard title="Microtask Queue" items={microtaskQueue} />
          </div>
        </CardContent>
      </Card>

      {/* 이벤트 루프 박스: 페이즈 박스 위에 배치 */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <span>현재 페이즈: {phase}</span>
          </div>
        </CardContent>
      </Card>

      {/* 이벤트 루프 박스 */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Event Loop</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <span>{eventLoop}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
