import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./services/Auth/AuthProvider";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StatusProvider} from "./statusPageContext";

if (process.env["ENV_MODE"] === "production") {
  disableReactDevTools();
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StatusProvider>
          <Routes>
            <Route path="/*" element={<App />} />
          </Routes>
        </StatusProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
