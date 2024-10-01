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
  dispatch: React.Dispatch<ExecutionAction>
) {
  try {
    console.log("### 코드 실행 함수 시작");
    const ast = parse(code, { ecmaVersion: "latest" });
    const executionContext: ExecutionContext = {
      callStack: ["global"],
      variableEnv: {},
    };

    // 코드 실행을 단계별로 진행하기 위한 함수
    const executeNode = async (node: ASTNode) => {
      console.log(`### executeNode 호출: 노드 타입 ${node.type}`);
      switch (node.type) {
        case "Program":
          // 프로그램의 본문 노드들을 실행
          for (const bodyNode of node.body) {
            await executeNode(bodyNode);
          }
          break;
        case "VariableDeclaration":
          // 변수 선언 처리
          for (const decl of node.declarations) {
            const varName = (decl.id as any).name;
            const varValue = decl.init
              ? evaluateExpression(decl.init, executionContext)
              : undefined;
            executionContext.variableEnv[varName] = varValue;
            console.log(`### 선언된 변수: ${varName} = ${varValue}`);
            dispatch({
              type: "UPDATE_CALL_STACK",
              payload: [...executionContext.callStack],
            });
          }
          break;
        case "ExpressionStatement":
          // 표현식 문 처리
          await executeNode(node.expression);
          break;
        case "CallExpression":
          // 함수 호출 처리
          const callee = node.callee;
          let calleeName = "";

          if (callee.type === "MemberExpression") {
            if (
              callee.object.type === "Identifier" &&
              callee.property.type === "Identifier"
            ) {
              calleeName = `${callee.object.name}.${callee.property.name}`;
            }
          } else if (callee.type === "Identifier") {
            calleeName = callee.name;
          }

          console.log(`### 호출 표현식 감지: ${calleeName}`);
          executionContext.callStack.push(calleeName);
          dispatch({
            type: "UPDATE_CALL_STACK",
            payload: [...executionContext.callStack],
          });

          // 간단한 콘솔 로그 처리
          if (calleeName === "console.log") {
            const args = node.arguments.map((arg) =>
              evaluateExpression(arg, executionContext)
            );
            console.log("### console.log 호출: 인수들:", ...args);
          }

          executionContext.callStack.pop();
          dispatch({
            type: "UPDATE_CALL_STACK",
            payload: [...executionContext.callStack],
          });
          break;
        case "FunctionDeclaration":
          // 함수 선언 처리
          const funcName = (node.id as any).name;
          console.log(`### 선언된 함수: ${funcName}`);
          executionContext.variableEnv[funcName] = node;
          break;
        case "ReturnStatement":
          // 반환문 처리
          console.log("### 반환문 발견");
          // 간단히 반환값 처리
          break;
        // 필요에 따라 더 많은 노드 타입 처리
        default:
          console.warn(`### 처리되지 않은 노드 타입: ${node.type}`);
      }
    };

    // 표현식을 평가하는 함수
    const evaluateExpression = (expr: any, context: ExecutionContext) => {
      console.log(`### 평가할 표현식 타입: ${expr.type}`);
      switch (expr.type) {
        case "Literal":
          return expr.value;
        case "Identifier":
          return context.variableEnv[expr.name];
        case "BinaryExpression":
          const left = evaluateExpression(expr.left, context);
          const right = evaluateExpression(expr.right, context);
          console.log(`### 이항 표현식: ${left} ${expr.operator} ${right}`);
          switch (expr.operator) {
            case "+":
              return left + right;
            case "-":
              return left - right;
            // 다른 연산자 처리
            default:
              return undefined;
          }
        // 필요에 따라 더 많은 표현식 처리
        default:
          return undefined;
      }
    };

    // 프로그램 실행
    await executeNode(ast as ASTNode);

    console.log("### 코드 실행 완료");

    // 성능 메트릭 업데이트 (임의의 값으로 설정)
    dispatch({
      type: "UPDATE_PERFORMANCE_METRICS",
      payload: { memoryUsage: "45.32%", executionTime: "0.23s" },
    });
  } catch (error) {
    console.error("### 코드 실행 중 오류 발생:", error);
    // 오류 상태 업데이트 로직 추가 가능
  }
}
