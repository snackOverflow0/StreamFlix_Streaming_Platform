import React from "react";
import PasswordRecovery from "./services/password-recovery";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PasswordRecovery />
    <App />
  </React.StrictMode>,
);
