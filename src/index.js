import React from 'react';
import ReactDOM from 'react-dom';
import { createGlobalStyle } from 'styled-components';
import Router from './router';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Lato');

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body {
    box-sizing: border-box;
  }

  body {
    font-family: 'Lato', sans-serif;
  }
`;

ReactDOM.render(
  <>
    <GlobalStyles />
    <Router />
  </>,
  document.getElementById('root'), // eslint-disable-line
);
