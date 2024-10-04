// src/shared/lib/executor.ts

import { parse, Node } from "acorn";
import { ExecutionAction, ExecutionStep } from "@/shared/types/type";

// AST 노드를 타입별로 구분하기 위한 타입 정의
type ASTNode = Node;

// 변수 환경 스택
interface VariableEnvironment {
  [key: string]: any;
}

// 태스크 타입 정의
interface Task {
  delay: number;
  func: () => Promise<void>;
  name: string;
}

// 실행 컨텍스트
interface ExecutionContext {
  callStack: string[];
  variableEnv: VariableEnvironment;
  taskQueue: Task[];
  microtaskQueue: (() => Promise<void>)[];
}

// 주어진 코드 문자열을 실행하는 비동기 함수
export async function executeCode(
  code: string,
  dispatch: React.Dispatch<ExecutionAction>
) {
  const ast = parse(code, { ecmaVersion: "latest", locations: true });

  // 실행 컨텍스트 초기화
  const context: ExecutionContext = {
    callStack: [],
    variableEnv: {},
    taskQueue: [],
    microtaskQueue: [],
  };

  // 실행 단계별 상태를 저장할 배열
  const executionSteps: ExecutionStep[] = [];

  // 프로그램 시작 시점의 상태 저장
  executionSteps.push({
    callStack: [...context.callStack],
    taskQueue: context.taskQueue.map((task) => task.name),
    microtaskQueue: context.microtaskQueue.map((_, idx) => `microtask-${idx}`),
    currentNode: null,
  });

  // AST 실행 시작
  await executeNode(ast, context, executionSteps);

  // 이벤트 루프 실행
  await eventLoop(context, executionSteps);

  // 실행 완료 후 상태를 리듀서에 전달
  dispatch({
    type: "RUN",
    payload: {
      ast: ast,
      executionSteps: executionSteps,
    },
  });
}

// AST 노드를 실행하는 함수
async function executeNode(
  node: ASTNode,
  context: ExecutionContext,
  executionSteps: ExecutionStep[]
) {
  switch (node.type) {
    case "Program":
      for (const stmt of node.body) {
        await executeNode(stmt, context, executionSteps);
      }
      break;
    case "FunctionDeclaration":
      // 함수 선언을 변수 환경에 저장
      const funcName = node.id.name;
      context.variableEnv[funcName] = createFunction(
        node,
        context,
        executionSteps,
        funcName
      );
      break;
    case "VariableDeclaration":
      for (const decl of node.declarations) {
        await executeNode(decl, context, executionSteps);
      }
      break;
    case "VariableDeclarator":
      if (node.init) {
        const value = await evaluateExpression(node.init, context, executionSteps);
        context.variableEnv[node.id.name] = value;
      } else {
        context.variableEnv[node.id.name] = undefined;
      }
      break;
    case "ExpressionStatement":
      await executeNode(node.expression, context, executionSteps);
      break;
    case "CallExpression":
      await executeCallExpression(node, context, executionSteps);
      break;
    // 필요한 경우 다른 노드 타입 처리
    default:
      console.warn(`Unhandled node type: ${node.type}`);
  }
}

// 함수 객체 생성
function createFunction(
  node: any,
  context: ExecutionContext,
  executionSteps: ExecutionStep[],
  name: string
) {
  const func = async function () {
    // 함수 호출 시 콜 스택에 추가
    context.callStack.push(name);
    // 실행 단계 저장
    executionSteps.push({
      callStack: [...context.callStack],
      taskQueue: context.taskQueue.map((task) => task.name),
      microtaskQueue: context.microtaskQueue.map((_, idx) => `microtask-${idx}`),
      currentNode: node,
    });
    // 함수 본문 실행
    for (const stmt of node.body.body) {
      await executeNode(stmt, context, executionSteps);
    }
    // 함수 실행 완료 후 콜 스택에서 제거
    context.callStack.pop();
    // 실행 단계 저장
    executionSteps.push({
      callStack: [...context.callStack],
      taskQueue: context.taskQueue.map((task) => task.name),
      microtaskQueue: context.microtaskQueue.map((_, idx) => `microtask-${idx}`),
      currentNode: node,
    });
  };
  Object.defineProperty(func, "name", { value: name });
  return func;
}

// CallExpression 실행
async function executeCallExpression(
  node: any,
  context: ExecutionContext,
  executionSteps: ExecutionStep[]
) {
  // 함수 이름 가져오기
  const callee = node.callee;
  if (callee.type === "Identifier") {
    const funcName = callee.name;
    if (funcName === "setTimeout") {
      // setTimeout 처리
      await handleSetTimeout(node, context, executionSteps);
    } else {
      const func = context.variableEnv[funcName];
      if (func) {
        await func();
      } else {
        console.error(`Function ${funcName} is not defined.`);
      }
    }
  } else if (callee.type === "FunctionExpression") {
    // 즉시 실행 함수 처리 (필요 시)
    const func = createAnonymousFunction(
      callee,
      context,
      executionSteps,
      "anonymous"
    );
    await func();
  } else {
    console.error(`Unsupported callee type: ${callee.type}`);
  }
}

// setTimeout 처리 함수
async function handleSetTimeout(
  node: any,
  context: ExecutionContext,
  executionSteps: ExecutionStep[]
) {
  // 첫 번째 인자는 콜백 함수
  const callbackNode = node.arguments[0];
  // 두 번째 인자는 지연 시간(ms)
  const delayNode = node.arguments[1];
  let delay = 0;
  if (delayNode && delayNode.type === "Literal") {
    delay = delayNode.value;
  }

  // 콜백 함수 생성
  const callbackFunction = createAnonymousFunction(
    callbackNode,
    context,
    executionSteps,
    callbackNode.id ? callbackNode.id.name : "anonymous"
  );

  // 태스크 큐에 태스크 추가 (지연 시간 순으로 정렬)
  context.taskQueue.push({
    delay,
    func: callbackFunction,
    name: callbackNode.id ? callbackNode.id.name : "anonymous",
  });
  context.taskQueue.sort((a, b) => a.delay - b.delay);

  // 실행 단계 저장
  executionSteps.push({
    callStack: [...context.callStack],
    taskQueue: context.taskQueue.map((task) => task.name),
    microtaskQueue: context.microtaskQueue.map((_, idx) => `microtask-${idx}`),
    currentNode: node,
  });
}

// 익명 함수 생성 (FunctionExpression)
function createAnonymousFunction(
  node: any,
  context: ExecutionContext,
  executionSteps: ExecutionStep[],
  name: string
) {
  const func = async function () {
    // 함수 호출 시 콜 스택에 추가
    context.callStack.push(name);
    // 실행 단계 저장
    executionSteps.push({
      callStack: [...context.callStack],
      taskQueue: context.taskQueue.map((task) => task.name),
      microtaskQueue: context.microtaskQueue.map((_, idx) => `microtask-${idx}`),
      currentNode: node,
    });
    // 함수 본문 실행
    for (const stmt of node.body.body) {
      await executeNode(stmt, context, executionSteps);
    }
    // 함수 실행 완료 후 콜 스택에서 제거
    context.callStack.pop();
    // 실행 단계 저장
    executionSteps.push({
      callStack: [...context.callStack],
      taskQueue: context.taskQueue.map((task) => task.name),
      microtaskQueue: context.microtaskQueue.map((_, idx) => `microtask-${idx}`),
      currentNode: node,
    });
  };
  Object.defineProperty(func, "name", { value: name });
  return func;
}

// 이벤트 루프 시뮬레이션
async function eventLoop(
  context: ExecutionContext,
  executionSteps: ExecutionStep[]
) {
  // 현재 시간
  let currentTime = 0;
  // 태스크 큐의 태스크가 없을 때까지 반복
  while (context.taskQueue.length > 0 || context.microtaskQueue.length > 0) {
    // 마이크로태스크 처리
    while (context.microtaskQueue.length > 0) {
      const microtask = context.microtaskQueue.shift();
      await microtask();
      // 실행 단계 저장
      executionSteps.push({
        callStack: [...context.callStack],
        taskQueue: context.taskQueue.map((task) => task.name),
        microtaskQueue: context.microtaskQueue.map((_, idx) => `microtask-${idx}`),
        currentNode: null,
      });
    }

    // 태스크 처리
    if (context.taskQueue.length > 0) {
      const task = context.taskQueue.shift();
      // 지연 시간 시뮬레이션
      if (task.delay > currentTime) {
        currentTime = task.delay;
      }
      await task.func();
      // 실행 단계 저장
      executionSteps.push({
        callStack: [...context.callStack],
        taskQueue: context.taskQueue.map((task) => task.name),
        microtaskQueue: context.microtaskQueue.map((_, idx) => `microtask-${idx}`),
        currentNode: null,
      });
    }
  }
}

// 표현식 평가 함수 (필요 시 확장)
async function evaluateExpression(
  node: any,
  context: ExecutionContext,
  executionSteps: ExecutionStep[]
): Promise<any> {
  switch (node.type) {
    case "Literal":
      return node.value;
    case "Identifier":
      return context.variableEnv[node.name];
    case "CallExpression":
      await executeCallExpression(node, context, executionSteps);
      return undefined;
    default:
      console.warn(`Unhandled expression type: ${node.type}`);
      return undefined;
  }
}
