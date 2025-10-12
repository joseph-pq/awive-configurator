import React from "react";
import themeOptions from "./theme/AppTheme";
import { ThemeProvider } from "@mui/material/styles";
import ReactDOM from "react-dom/client";
import { StyledEngineProvider } from "@mui/material/styles";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <ThemeProvider theme={themeOptions}>
    <React.StrictMode>
      <StyledEngineProvider injectFirst>
        <App />
      </StyledEngineProvider>
    </React.StrictMode>
  </ThemeProvider>,
);
