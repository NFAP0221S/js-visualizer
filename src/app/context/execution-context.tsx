import { createContext, useReducer, ReactNode, Dispatch } from 'react';
import { executionReducer, initialState } from './execution-reducer';
import { ExecutionState, ExecutionAction } from '@/shared/types/type';

interface ExecutionContextProps {
  state: ExecutionState;
  dispatch: Dispatch<ExecutionAction>;
}

export const ExecutionContext = createContext<ExecutionContextProps>({
  state: initialState,
  dispatch: () => null,
});

export const ExecutionProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(executionReducer, initialState);

  return (
    <ExecutionContext.Provider value={{ state, dispatch }}>
      {children}
    </ExecutionContext.Provider>
  );
};
