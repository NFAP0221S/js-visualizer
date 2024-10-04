// src/shared/reducers/executionReducer.ts

import { ExecutionState, ExecutionAction } from "@/shared/types/type";

export const initialState: ExecutionState = {
  isRunning: false,
  step: 0,
  code: "// Enter your JavaScript code here\n",
  callStack: [],
  eventLoop: [],
  taskQueue: [],
  microtaskQueue: [],
  ast: null, // AST 상태 추가
  executionSteps: [], // 실행 단계별 상태 추가
};

export function executionReducer(
  state: ExecutionState,
  action: ExecutionAction
): ExecutionState {
  switch (action.type) {
    case "SET_CODE":
      return { ...state, code: action.payload };
    case "RUN":
      return {
        ...state,
        isRunning: true,
        ast: action.payload.ast, // AST 저장
        executionSteps: action.payload.executionSteps, // 실행 단계 저장
        step: 0, // 스텝 초기화
      };
    case "PAUSE":
      return { ...state, isRunning: false };
    case "STEP_FORWARD":
      if (state.step < state.executionSteps.length - 1) {
        return { ...state, step: state.step + 1 };
      } else {
        return { ...state, isRunning: false };
      }
    case "RESET":
      return { ...initialState };
    case "UPDATE_CALL_STACK":
      return { ...state, callStack: action.payload };
    case "UPDATE_EVENT_LOOP":
      return { ...state, eventLoop: action.payload };
    case "UPDATE_TASK_QUEUE":
      return { ...state, taskQueue: action.payload };
    case "UPDATE_MICROTASK_QUEUE":
      return { ...state, microtaskQueue: action.payload };
    default:
      return state;
  }
}
