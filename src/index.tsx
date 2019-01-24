/**
 * This is the main entry point of React application.
 */
import * as React from "react";
import * as DOM from "react-dom";
import { AppRouter } from "./router";

const root = document.getElementById("root");

DOM.render(<AppRouter />, root);