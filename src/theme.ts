import { createMuiTheme } from "@material-ui/core/styles";

const defaultTheme = createMuiTheme({
  typography: {
    useNextVariants: true,
    fontSize: 16
    // use the system font instead of the default Roboto font.
    // fontFamily: ["K2D", "sans-serif"].join(",")
  }
});
const { typography, breakpoints, spacing } = defaultTheme;

export const theme = createMuiTheme({
  typography: {
    ...typography,
    h1: {
      fontSize: typography.pxToRem(28),
      lineHeight: typography.pxToRem(28),
      marginTop: spacing.unit * 3,
      marginBottom: spacing.unit * 3,
      [breakpoints.up("md")]: {
        fontSize: typography.pxToRem(36),
        lineHeight: typography.pxToRem(36)
      }
    },
    h2: {
      fontSize: typography.pxToRem(24),
      lineHeight: typography.pxToRem(24),
      marginBottom: spacing.unit * 3,
      [breakpoints.up("md")]: {
        fontSize: typography.pxToRem(28),
        lineHeight: typography.pxToRem(28)
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
