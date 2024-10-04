// src/shared/lib/executor.ts

import { parse, Node } from "acorn";
import { ExecutionAction, ExecutionStep } from "@/shared/types/type";

// AST 노드를 타입별로 구분하기 위한 타입 정의
type ASTNode = Node;

// 변수 환경 스택
interface VariableEnvironment {
  [key: string]: any;
}

// 실행 컨텍스트
interface ExecutionContext {
  callStack: string[];
  variableEnv: VariableEnvironment;
  taskQueue: Function[];
  microtaskQueue: Function[];
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
    taskQueue: [...context.taskQueue],
    microtaskQueue: [...context.microtaskQueue],
    currentNode: null,
  });

  // AST 실행 시작
  await executeNode(ast, context, executionSteps);

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
        executionSteps
      );
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
  executionSteps: ExecutionStep[]
) {
  const func = async function () {
    // 함수 호출 시 콜 스택에 추가
    context.callStack.push(node.id.name);
    // 실행 단계 저장
    executionSteps.push({
      callStack: [...context.callStack],
      taskQueue: [...context.taskQueue],
      microtaskQueue: [...context.microtaskQueue],
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
      taskQueue: [...context.taskQueue],
      microtaskQueue: [...context.microtaskQueue],
      currentNode: node,
    });
  };
  Object.defineProperty(func, "name", { value: node.id.name });
  return func;
}

// CallExpression 실행
async function executeCallExpression(
  node: any,
  context: ExecutionContext,
  executionSteps: ExecutionStep[]
) {
  // 함수 이름 가져오기
  const funcName = node.callee.name;
  const func = context.variableEnv[funcName];
  if (func) {
    await func();
  } else {
    console.error(`Function ${funcName} is not defined.`);
  }
}

// 비동기 작업 처리 (필요 시 구현)
// function handleMicrotask(...) { ... }
// function handleTask(...) { ... }
