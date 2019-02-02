/**
 * This is the main entry point of React application.
 * NOTE: bootstrap.ts file must be imported first
 */
import "./bootstrap";

import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import * as React from "react";
import * as DOM from "react-dom";
import { AppRouter } from "./router";

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  }
});

DOM.render(
  <ThemeProvider theme={theme}>
    <AppRouter />
  </ThemeProvider>,
  document.getElementById("root")
);
