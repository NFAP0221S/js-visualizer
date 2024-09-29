import { Execution } from "@/widgets/execution";
import { CodeEditor } from "@/widgets/code-editor";

export function App() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 lg:p-8">
      <h1 className="text-3xl lg:text-4xl font-bold mb-6 lg:mb-8 text-center text-primary animate-pulse">
        자바스크립트 실행컨텍스트
      </h1>
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        <CodeEditor />
        <Execution />
      </div>
    </div>
  );
}
