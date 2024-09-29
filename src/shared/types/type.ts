export interface ExecutionState {
    isRunning: boolean;
    step: number;
    code: string;
    callStack: string[];
    eventLoop: string[];
    taskQueue: string[];
    microtaskQueue: string[];
    memoryUsage: string;
    executionTime: string;
  }
  
  export type ExecutionAction =
    | { type: 'SET_CODE'; payload: string }
    | { type: 'RUN' }
    | { type: 'PAUSE' }
    | { type: 'STEP_FORWARD' }
    | { type: 'RESET' }
    | { type: 'UPDATE_CALL_STACK'; payload: string[] }
    | { type: 'UPDATE_EVENT_LOOP'; payload: string[] }
    | { type: 'UPDATE_TASK_QUEUE'; payload: string[] }
    | { type: 'UPDATE_MICROTASK_QUEUE'; payload: string[] }
    | { type: 'UPDATE_PERFORMANCE_METRICS'; payload: { memoryUsage: string; executionTime: string } };