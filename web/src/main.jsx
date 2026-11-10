/* React 18 entry — providers in dependency order:
   CaseState (sessionStorage case record) → Language → Toasts → API mode.
   Render target: web/index.html (#root), fonts + tokens already loaded there. */

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { CaseStateProvider } from "./lib/state.jsx";
import { LangProvider } from "./lib/i18n.jsx";
import { ToastProvider } from "./hooks/useToast.jsx";
import { ModeProvider } from "./hooks/useMode.jsx";
import "./styles/tokens.css";
import "./styles/app.css";
import "./styles/studio.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CaseStateProvider>
      <LangProvider>
        <ToastProvider>
          <ModeProvider>
            <App />
          </ModeProvider>
        </ToastProvider>
      </LangProvider>
    </CaseStateProvider>
  </React.StrictMode>
);
