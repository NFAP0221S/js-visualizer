// src/shared/types/type.ts

import { Node as ASTNode } from "acorn";

export interface ExecutionStep {
  callStack: string[];
  taskQueue: any[];
  microtaskQueue: any[];
  currentNode: ASTNode | null;
}

export interface ExecutionState {
  isRunning: boolean;
  step: number;
  code: string;
  callStack: string[];
  eventLoop: any[];
  taskQueue: any[];
  microtaskQueue: any[];
  ast: ASTNode | null;
  executionSteps: ExecutionStep[];
}

export type ExecutionAction =
  | { type: "SET_CODE"; payload: string }
  | { type: "RUN"; payload: { ast: ASTNode; executionSteps: ExecutionStep[] } }
  | { type: "PAUSE" }
  | { type: "STEP_FORWARD" }
  | { type: "RESET" }
  | { type: "UPDATE_CALL_STACK"; payload: string[] }
  | { type: "UPDATE_EVENT_LOOP"; payload: any[] }
  | { type: "UPDATE_TASK_QUEUE"; payload: any[] }
  | { type: "UPDATE_MICROTASK_QUEUE"; payload: any[] };
