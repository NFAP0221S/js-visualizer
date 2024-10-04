// src/components/CodeEditor.tsx

"use client";

import { useContext } from "react";
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
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import { ExecutionContext } from "@/app/context/execution-context";
import { executeCode } from "@/shared/lib/executor";
import { LineNumbers } from "./line-numbers";

export function CodeEditor() {
  const { state, dispatch } = useContext(ExecutionContext);
  const { code, isRunning, executionSteps, step } = state; // executionSteps와 step 가져오기

  // Prism을 사용한 구문 강조 함수
  const highlightCode = (code: string) => {
    return Prism.highlight(code, Prism.languages.javascript, "javascript");
  };

  // 실행 함수
  const handleRun = () => {
    dispatch({ type: "RESET" }); // 실행 전 상태 초기화
    executeCode(code, dispatch); // 코드 실행
  };

  // 일시 정지 함수
  const handlePause = () => {
    dispatch({ type: "PAUSE" });
  };

  // 스텝 진행 함수
  const handleStep = () => {
    dispatch({ type: "STEP_FORWARD" });
  };

  // 리셋 함수
  const handleReset = () => {
    dispatch({ type: "RESET" });
  };

  // 현재 스텝의 실행 단계 가져오기
  const currentExecutionStep = executionSteps[step];

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Code Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md overflow-hidden mb-4 flex">
          <LineNumbers code={code} />
          <div className="relative flex-1">
            <Editor
              value={code}
              onValueChange={(newCode) =>
                dispatch({ type: "SET_CODE", payload: newCode })
              }
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
          <Button
            onClick={handleStep}
            disabled={!isRunning || step >= executionSteps.length - 1}
            variant="outline"
          >
            <StepForwardIcon className="mr-2 h-4 w-4" /> Step
          </Button>
          <Button onClick={handleReset} variant="destructive">
            <RotateCwIcon className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
        {/* 실행 단계 시각화 */}
        // 실행 단계 시각화 부분 수정
        <div className="mt-4">
          <h3>Call Stack:</h3>
          <ul>
            {currentExecutionStep?.callStack.map((funcName, index) => (
              <li key={index}>{funcName}</li>
            ))}
          </ul>
          {/* 태스크 큐와 마이크로태스크 큐도 유사하게 표시 */}
          <h3>Task Queue:</h3>
          <ul>
            {currentExecutionStep?.taskQueue.map((taskName, index) => (
              <li key={index}>{taskName}</li>
            ))}
          </ul>
          <h3>Microtask Queue:</h3>
          <ul>
            {currentExecutionStep?.microtaskQueue.map(
              (microtaskName, index) => (
                <li key={index}>{microtaskName}</li>
              )
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
