"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import {
  PlayIcon,
  PauseIcon,
  StepForwardIcon,
  RotateCwIcon,
} from "lucide-react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-javascript"; // JavaScript 구문 강조
import "prismjs/themes/prism.css"; // Prism 테마 (기본 테마)

// 라인 번호를 표시하기 위한 간단한 컴포넌트
function LineNumbers({ code }: { code: string }) {
  const lines = code.split("\n").length;
  const numbers = Array.from({ length: lines }, (_, i) => i + 1);
  return (
    <div className="line-numbers">
      {numbers.map((number) => (
        <div key={number} className="line-number">
          {number}
        </div>
      ))}
    </div>
  );
}

export function CodeEditor() {
  const [code, setCode] = useState("// Enter your JavaScript code here\n");
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    console.log(step);
  }, [step])

  const handleRun = () => {
    setIsRunning(true);
    // 코드 실행 로직 추가
  };

  const handlePause = () => {
    setIsRunning(false);
    // 코드 일시정지 로직 추가
  };

  const handleStep = () => {
    setStep((prev) => prev + 1);
    // 단계 실행 로직 추가
  };

  const handleReset = () => {
    setIsRunning(false);
    setCode("// Enter your JavaScript code here\n");
    setStep(0);
    // 코드 리셋 로직 추가
  };

  // Prism를 사용한 구문 강조 함수
  const highlightCode = (code: string) => {
    return Prism.highlight(code, Prism.languages.javascript, "javascript");
  };

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Code Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md overflow-hidden mb-4 flex">
          {/* 라인 번호 표시 */}
          <LineNumbers code={code} />
          {/* 코드 에디터 */}
          <div className="relative flex-1">
            <Editor
              value={code}
              onValueChange={(code) => setCode(code)}
              highlight={highlightCode}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                minHeight: "300px",
                outline: 0, // 포커스 시 외곽선 제거
              }}
              className="code-editor"
            />
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={handleRun} disabled={isRunning} variant="default">
            <PlayIcon className="mr-2 h-4 w-4" /> Run
          </Button>
          <Button
            onClick={handlePause}
            disabled={!isRunning}
            variant="secondary"
          >
            <PauseIcon className="mr-2 h-4 w-4" /> Pause
          </Button>
          <Button onClick={handleStep} disabled={!isRunning} variant="outline">
            <StepForwardIcon className="mr-2 h-4 w-4" /> Step
          </Button>
          <Button onClick={handleReset} variant="destructive">
            <RotateCwIcon className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
