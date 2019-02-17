import { Theme } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import React from "react";

const useStyles = makeStyles(({ spacing, palette }: Theme) => ({
  root: {
    flexGrow: 1
  },
  margin: {
    marginRight: spacing.unit * 2,
    marginTop: spacing.unit,
    marginBottom: spacing.unit
  },
  fullWidth: {
    flexGrow: 1,
    width: "100%"
  },
  cssLabel: {
    "&$cssFocused": {
      color: palette.primary.main
    }
  },
  cssFocused: {},
  cssUnderline: {
    "&:after": {
      borderBottomColor: palette.primary.main
    }
  }
}));

export const SOMControls = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container={true} spacing={24}>
        <Grid item={true} xs={12}>
          <Typography variant="body1">Model</Typography>
          <form noValidate={true} autoComplete="off">
            <Grid container={true} spacing={8}>
              <Grid item={true} xs={6} sm={4} md={2}>
                <FormControl className={classes.fullWidth}>
                  <InputLabel
                    required={true}
                    htmlFor="columns"
                    classes={{
                      root: classes.cssLabel,
                      focused: classes.cssFocused
                    }}
                  >
                    Columns
                  </InputLabel>
                  <Input
                    id="columns"
                    defaultValue={25}
                    required={true}
                    fullWidth={true}
                    classes={{
                      underline: classes.cssUnderline
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item={true} xs={6} sm={4} md={2}>
                <FormControl className={classes.fullWidth}>
                  <InputLabel
                    htmlFor="rows"
                    required={true}
                    classes={{
                      root: classes.cssLabel,
                      focused: classes.cssFocused
                    }}
                  >
                    Rows
                  </InputLabel>
                  <Input
                    id="rows"
                    fullWidth={true}
                    defaultValue={12}
                    required={true}
                    classes={{
                      underline: classes.cssUnderline
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item={true} xs={6} sm={4} md={2}>
                <FormControl className={classes.fullWidth}>
                  <InputLabel
                    htmlFor="hexagonSize"
                    required={true}
                    classes={{
                      root: classes.cssLabel,
                      focused: classes.cssFocused
                    }}
                  >
                    Hexagon size
                  </InputLabel>
                  <Input
                    id="hexagonSize"
                    fullWidth={true}
                    defaultValue={50}
                    required={true}
                    classes={{
                      underline: classes.cssUnderline
                    }}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </form>
        </Grid>
        <Grid item={true} xs={12}>
          <Typography variant="body1">Training</Typography>
          <form noValidate={true} autoComplete="off">
            <Grid container={true} spacing={8}>
              <Grid item={true} xs={12} sm={4} md={2}>
                <FormControl className={classes.fullWidth}>
                  <InputLabel
                    htmlFor="iterations"
                    required={true}
                    classes={{
                      root: classes.cssLabel,
                      focused: classes.cssFocused
                    }}
                  >
                    Iterations
                  </InputLabel>
                  <Input
                    id="iterations"
                    defaultValue={1000}
                    fullWidth={true}
                    required={true}
                    classes={{
                      underline: classes.cssUnderline
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item={true} xs={6} sm={4} md={2}>
                <FormControl className={classes.fullWidth}>
                  <InputLabel
                    htmlFor="minLearningCoefficient"
                    required={true}
                    classes={{
                      root: classes.cssLabel,
                      focused: classes.cssFocused
                    }}
                  >
                    Min learn. coef.
                  </InputLabel>
                  <Input
                    id="minLearningCoefficient"
                    defaultValue={0.1}
                    fullWidth={true}
                    required={true}
                    classes={{
                      underline: classes.cssUnderline
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item={true} xs={6} sm={4} md={2}>
                <FormControl className={classes.fullWidth}>
                  <InputLabel
                    htmlFor="maxLearningCoefficient"
                    required={true}
                    classes={{
                      root: classes.cssLabel,
                      focused: classes.cssFocused
                    }}
                  >
                    Max learn. coef.
                  </InputLabel>
                  <Input
                    id="maxLearningCoefficient"
                    defaultValue={0.4}
                    fullWidth={true}
                    required={true}
                    classes={{
                      underline: classes.cssUnderline
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item={true} xs={6} sm={4} md={2}>
                <FormControl className={classes.fullWidth}>
                  <InputLabel
                    htmlFor="minNeighborhood"
                    required={true}
                    classes={{
                      root: classes.cssLabel,
                      focused: classes.cssFocused
                    }}
                  >
                    Min neighbor
                  </InputLabel>
                  <Input
                    id="minNeighborhood"
                    defaultValue={0.3}
                    fullWidth={true}
                    required={true}
                    classes={{
                      underline: classes.cssUnderline
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item={true} xs={6} sm={4} md={2}>
                <FormControl className={classes.fullWidth}>
                  <InputLabel
                    htmlFor="maxNeighborhood"
                    required={true}
                    classes={{
                      root: classes.cssLabel,
                      focused: classes.cssFocused
                    }}
                  >
                    Max neighbor
                  </InputLabel>
                  <Input
                    id="maxNeighborhood"
                    defaultValue={1}
                    fullWidth={true}
                    required={true}
                    classes={{
                      underline: classes.cssUnderline
                    }}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </div>
  );
};
