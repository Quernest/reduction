import { ThemeProvider } from "@material-ui/styles";
import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { AppRouter } from "./router";
import { theme } from "./theme";

// import i18n translations
import './i18n';

// i18n translations might still be loaded by the xhr backend
// use react's Suspense
ReactDOM.render(
  <Suspense fallback="loading">
    <ThemeProvider theme={theme}>
      <AppRouter />
    </ThemeProvider>
  </Suspense>,
  document.getElementById("root")
);
