/**
 * This is the main entry point of React application.
 * NOTE: bootstrap.ts file must be imported first
 */
import "./bootstrap";

import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import React from "react";
import ReactDOM from "react-dom";
import { AppRouter } from "./router";

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
    // use the system font instead of the default Roboto font.
    fontFamily: ["K2D", "sans-serif"].join(",")
  }
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <AppRouter />
  </ThemeProvider>,
  document.getElementById("root")
);
