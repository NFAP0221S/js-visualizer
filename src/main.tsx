import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import "@/assets/css/global.css";
import { ExecutionProvider } from "@/app/context/execution-context";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ExecutionProvider>
      <App />
    </ExecutionProvider>
  </StrictMode>
);
