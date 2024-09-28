"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import Editor from "react-simple-code-editor";
import {
  PlayIcon,
  PauseIcon,
  StepForwardIcon,
  RotateCwIcon,
} from "lucide-react";

export function CodeEditor() {
  const [code, setCode] = useState("// Enter your JavaScript code here\n");
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);
  console.log(step);
  const handleRun = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStep = () => {
    setStep((prev) => prev + 1);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCode("// Enter your JavaScript code here\n");
    setStep(0);
  };

  const highlightWithLineNumbers = (input: string) => {
    const lines = input.split("\n");
    return lines.map((line, i) => (
      <div key={i} className="table-row">
        <span className="table-cell text-right pr-4 select-none opacity-50">
          {i + 1}
        </span>
        <span className="table-cell">{highlightSyntax(line)}</span>
      </div>
    ));
  };
  const highlightSyntax = (code: string) => {
    // Simple regex-based syntax highlighting
    return code
      .replace(
        /\/\/.*/g,
        (match) => `<span style="color: #6A9955;">${match}</span>`
      ) // Comments
      .replace(
        /\b(const|let|var|function|return|if|else|for|while)\b/g,
        (match) => `<span style="color: #569CD6;">${match}</span>`
      ) // Keywords
      .replace(
        /\b(\d+)\b/g,
        (match) => `<span style="color: #B5CEA8;">${match}</span>`
      ) // Numbers
      .replace(
        /(['"`]).*?\1/g,
        (match) => `<span style="color: #CE9178;">${match}</span>`
      ) // Strings
      .replace(
        /\b([A-Za-z_$][A-Za-z0-9_$]*)\(/g,
        (match, name) => `<span style="color: #DCDCAA;">${name}</span>(`
      ); // Function calls
  };
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Code Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md overflow-hidden mb-4">
          <div className="bg-muted text-muted-foreground py-2 px-4 text-sm">
            script.js
          </div>
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={(input) => highlightWithLineNumbers(input)}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 14,
              backgroundColor: "hsl(var(--background))",
              minHeight: "300px",
            }}
            className="min-h-[300px] w-full"
          />
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
