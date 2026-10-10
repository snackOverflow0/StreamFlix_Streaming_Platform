import React from "react";
import PasswordRecovery from "./services/password-recovery";
import {PlatformProvider} from "./services/platform";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PasswordRecovery />
    <PlatformProvider><App /></PlatformProvider>
  </React.StrictMode>,
);

