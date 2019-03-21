/**
 * This is the main entry point of React application.
 * NOTE: bootstrap.ts file must be imported first
 */
import "./bootstrap";

import { ThemeProvider } from "@material-ui/styles";
import React from "react";
import ReactDOM from "react-dom";
import { AppRouter } from "./router";
import { theme } from "./theme";

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <AppRouter />
  </ThemeProvider>,
  document.getElementById("root")
);
