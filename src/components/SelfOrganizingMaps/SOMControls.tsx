import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Grid from "@material-ui/core/Grid";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import React, { Component, createRef } from "react";
import { IHexagonalGridDimensions } from "src/models/chart.model";
import { ITrainingConfig } from "src/models/som.model";

const styles = ({ spacing, palette }: Theme) =>
  createStyles({
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
    },
    wrapper: {
      position: "relative"
    },
    buttonProgress: {
      color: palette.primary.main,
      position: "absolute",
      top: "50%",
      left: "50%",
      marginTop: -12,
      marginLeft: -12
    },
    space: {
      padding: 8,
      flexGrow: 1
    }
  });

interface IProps extends WithStyles<typeof styles> {
  trainingConfig: ITrainingConfig;
  dimensions: IHexagonalGridDimensions;
  onSubmit: (
    newDimensions: IHexagonalGridDimensions,
    newTrainingConfig: ITrainingConfig
  ) => void;
  loading?: boolean;
  onSwitchTraining: (checked: boolean) => void;
  withTraining?: boolean;
}

export const SOMControls = withStyles(styles)(
  class extends Component<IProps, {}> {
    private columnsInputRef = createRef<HTMLInputElement>();
    private rowsInputRef = createRef<HTMLInputElement>();
    private hexagonSizeInputRef = createRef<HTMLInputElement>();
    private iterationsInputRef = createRef<HTMLInputElement>();
    private minLearningCoefInputRef = createRef<HTMLInputElement>();
    private maxLearningCoefInputRef = createRef<HTMLInputElement>();
    private minNeighborhoodInputRef = createRef<HTMLInputElement>();
    private maxNeighborhoodInputRef = createRef<HTMLInputElement>();

    private getValueFromInputRef = (
      ref: React.RefObject<HTMLInputElement>
    ): number => {
      if (ref && ref.current) {
        const value = parseInt(ref.current.value, 10);

        return value;
      }

      return 0;
    };

    protected onSubmit = (event: React.FormEvent<EventTarget>): void => {
      event.preventDefault();

      const columnsInputValue = this.getValueFromInputRef(this.columnsInputRef);

      const rowsInputValue = this.getValueFromInputRef(this.rowsInputRef);

      const hexagonSizeInputValue = this.getValueFromInputRef(
        this.hexagonSizeInputRef
      );

      const iterationsInputValue = this.getValueFromInputRef(
        this.iterationsInputRef
      );

      const minLearningCoefInputRefValue = this.getValueFromInputRef(
        this.minLearningCoefInputRef
      );

      const maxLearningCoefInputRefValue = this.getValueFromInputRef(
        this.maxLearningCoefInputRef
      );

      const minNeighborhoodInputRefValue = this.getValueFromInputRef(
        this.minNeighborhoodInputRef
      );

      const maxNeighborhoodInputRefValue = this.getValueFromInputRef(
        this.maxNeighborhoodInputRef
      );

      const newDimensions: IHexagonalGridDimensions = {
        columns: columnsInputValue,
        rows: rowsInputValue,
        hexagonSize: hexagonSizeInputValue
      };

      const newTrainingConfig: ITrainingConfig = {
        maxStep: iterationsInputValue,
        minLearningCoef: minLearningCoefInputRefValue,
        maxLearningCoef: maxLearningCoefInputRefValue,
        minNeighborhood: minNeighborhoodInputRefValue,
        maxNeighborhood: maxNeighborhoodInputRefValue
      };

      this.props.onSubmit(newDimensions, newTrainingConfig);
    };

    protected onSwitchTraining = (
      event: React.ChangeEvent<HTMLInputElement>
    ): void => {
      const { checked } = event.target;

      this.props.onSwitchTraining(checked);
    };

    public render(): JSX.Element {
      const {
        classes,
        loading,
        dimensions,
        withTraining,
        trainingConfig
      } = this.props;
      const {
        maxStep,
        minLearningCoef,
        maxLearningCoef,
        minNeighborhood,
        maxNeighborhood
      } = trainingConfig;
      const { columns, rows, hexagonSize } = dimensions;

      return (
        <div className={classes.root}>
          <form autoComplete="off" onSubmit={this.onSubmit}>
            <Grid container={true} spacing={24}>
              <Grid item={true} xs={12}>
                <Typography variant="body1">Model</Typography>
                <Grid container={true} spacing={16}>
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
                        defaultValue={columns.toString()}
                        inputProps={{ min: "1", max: "150", step: "1" }}
                        required={true}
                        fullWidth={true}
                        inputRef={this.columnsInputRef}
                        type="number"
                        disabled={loading}
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
                        defaultValue={rows.toString()}
                        inputProps={{ min: "1", max: "150", step: "1" }}
                        fullWidth={true}
                        required={true}
                        inputRef={this.rowsInputRef}
                        disabled={loading}
                        type="number"
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
                        defaultValue={hexagonSize.toString()}
                        inputProps={{ min: "1", max: "250", step: "1" }}
                        fullWidth={true}
                        required={true}
                        disabled={loading}
                        inputRef={this.hexagonSizeInputRef}
                        type="number"
                        classes={{
                          underline: classes.cssUnderline
                        }}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item={true} xs={12}>
                <Typography variant="body1">Training</Typography>
                <Grid container={true} spacing={16}>
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
                        defaultValue={maxStep.toString()}
                        inputProps={{ min: "1", max: "100000", step: "1" }}
                        fullWidth={true}
                        inputRef={this.iterationsInputRef}
                        required={true}
                        type="number"
                        disabled={loading}
                        classes={{
                          underline: classes.cssUnderline
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item={true} xs={6} sm={4} md={2}>
                    <FormControl className={classes.fullWidth}>
                      <InputLabel
                        htmlFor="minLearningCoeff"
                        required={true}
                        classes={{
                          root: classes.cssLabel,
                          focused: classes.cssFocused
                        }}
                      >
                        Min learn. coef.
                      </InputLabel>
                      <Input
                        id="minLearningCoeff"
                        defaultValue={minLearningCoef.toString()}
                        inputProps={{ min: "0.1", max: "1", step: "0.1" }}
                        fullWidth={true}
                        inputRef={this.minLearningCoefInputRef}
                        required={true}
                        type="number"
                        disabled={loading}
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
                        defaultValue={maxLearningCoef.toString()}
                        inputProps={{ min: "0.1", max: "1", step: "0.1" }}
                        fullWidth={true}
                        inputRef={this.maxLearningCoefInputRef}
                        required={true}
                        type="number"
                        disabled={loading}
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
                        Min neighborhood
                      </InputLabel>
                      <Input
                        id="minNeighborhood"
                        defaultValue={minNeighborhood.toString()}
                        inputProps={{ min: "0.1", max: "1", step: "0.1" }}
                        fullWidth={true}
                        inputRef={this.minNeighborhoodInputRef}
                        required={true}
                        type="number"
                        disabled={loading}
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
                        Max neighborhood
                      </InputLabel>
                      <Input
                        id="maxNeighborhood"
                        defaultValue={maxNeighborhood.toString()}
                        inputProps={{ min: "0.1", max: "1", step: "0.1" }}
                        fullWidth={true}
                        inputRef={this.maxNeighborhoodInputRef}
                        required={true}
                        type="number"
                        disabled={loading}
                        classes={{
                          underline: classes.cssUnderline
                        }}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              <div className={classes.space}>
                <Grid container={true} alignItems="center" spacing={16}>
                  <Grid item={true} xs={12} sm={4} md={2}>
                    <div className={classes.wrapper}>
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        fullWidth={true}
                        type="submit"
                      >
                        Submit
                      </Button>
                      {loading && (
                        <CircularProgress
                          size={24}
                          className={classes.buttonProgress}
                        />
                      )}
                    </div>
                  </Grid>
                  <Grid item={true} xs={12} sm={4} md={2}>
                    <FormGroup row={true}>
                      <FormControlLabel
                        control={
                          <Switch
                            onChange={this.onSwitchTraining}
                            disabled={loading}
                            color="primary"
                            checked={withTraining}
                            value={withTraining}
                          />
                        }
                        label="Training"
                      />
                    </FormGroup>
                  </Grid>
                </Grid>
              </div>
            </Grid>
          </form>
        </div>
      );
    }
  }
);
