import { createMuiTheme } from "@material-ui/core/styles";

const defaultTheme = createMuiTheme({
  typography: {
    useNextVariants: true,
    fontSize: 16
  }
});

const { typography, breakpoints } = defaultTheme;

export const theme = createMuiTheme({
  typography: {
    ...typography,
    h1: {
      fontSize: typography.pxToRem(32),
      lineHeight: typography.pxToRem(42),
      [breakpoints.up("md")]: {
        fontSize: typography.pxToRem(42),
        lineHeight: typography.pxToRem(52)
      }
    },
    h2: {
      fontSize: typography.pxToRem(24),
      lineHeight: typography.pxToRem(34),
      [breakpoints.up("md")]: {
        fontSize: typography.pxToRem(28),
        lineHeight: typography.pxToRem(38)
      }
    },
    body1: {
      color: "rgba(0, 0, 0, 0.85)"
    },
    body2: {
      color: "rgba(0, 0, 0, 0.85)"
    }
  }
});
