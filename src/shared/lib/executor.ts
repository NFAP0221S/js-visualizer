// src/shared/lib/executor.ts
import { parse, Node } from "acorn";
import { ExecutionAction } from "@/shared/types/type"; // 실행 컨텍스트 정의

// AST 노드를 타입별로 구분하기 위한 타입 정의 (필요에 따라 확장 가능)
type ASTNode = Node;

// 간단한 변수 환경 스택
interface VariableEnvironment {
  [key: string]: any;
}

// 실행 컨텍스트
interface ExecutionContext {
  callStack: string[];
  variableEnv: VariableEnvironment;
}

// 주어진 코드 문자열을 실행하는 비동기 함수
export async function executeCode(
  code: string,
  dispatch: React.Dispatch<ExecutionAction>,
  node: ASTNode // node를 인자로 추가
) {
  console.log("### 코드 실행 시작");
  const ast = parse(code, { ecmaVersion: "latest" });
  console.log("### ast:", ast);
  const executionContext: ExecutionContext = {
    callStack: ["global"], // 초기 콜 스택에 global 추가
    variableEnv: {},
  };

  const executeNode = async (node: ASTNode) => {
    console.log(`### 노드 실행: ${node.type}`);
    
    switch (node.type) {
      case "Program":
        // Program 노드의 모든 바디 노드를 순차적으로 실행
        for (const bodyNode of node.body) {
          await executeNode(bodyNode); // 모든 바디 노드 실행
        }
        break;

      case "ExpressionStatement":
        // ExpressionStatement가 CallExpression을 포함하고 있는지 확인
        if (node.expression.type === "CallExpression") {
          const calleeName = node.expression.callee.type === "Identifier" 
            ? node.expression.callee.name 
            : `${node.expression.callee.object.name}.${node.expression.callee.property.name}`;

          executionContext.callStack.push(calleeName); // 콜 스택에 추가
          dispatch({ type: "UPDATE_CALL_STACK", payload: [...executionContext.callStack] });

          console.log(`### 콜 스택에 추가: ${calleeName}`); // 푸시 시 로그 출력

          // Dummy delay to mimic asynchronous behavior
          await new Promise(resolve => setTimeout(resolve, 100));

          // 현재 콜 스택 상태 로그
          console.log("### 현재 콜 스택:", executionContext.callStack);

          executionContext.callStack.pop(); // 콜 스택에서 제거
          dispatch({ type: "UPDATE_CALL_STACK", payload: [...executionContext.callStack] });

          console.log(`### 콜 스택에서 제거: ${calleeName}`); // 팝 시 로그 출력
        }
        break;

      case "FunctionDeclaration":
        const funcName = node.id.name;
        executionContext.variableEnv[funcName] = node; // 함수 저장
        break;

      default:
        console.warn(`처리되지 않은 노드 타입: ${node.type}`);
    }
  };

  // 현재 스텝을 기준으로 노드를 실행합니다.
  await executeNode(node); // 현재 스텝의 노드를 실행합니다.

  console.log("### 코드 실행 완료");
}
