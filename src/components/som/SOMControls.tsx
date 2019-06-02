import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import isEmpty from "lodash/isEmpty";
import React from "react";
import compose from "recompose/compose";
import { withTranslation, WithTranslation } from 'react-i18next';
import { FactorSelector } from ".";
import { IHexagonalGridDimensions, ISOMOptions } from "../../models";

const styles = ({ palette }: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
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
      padding: 12,
      flexGrow: 1
    }
  });

interface ISOMControlsProps extends WithStyles<typeof styles>, WithTranslation {
  options: ISOMOptions;
  dimensions: IHexagonalGridDimensions;
  onSubmit: (
    newDimensions: IHexagonalGridDimensions,
    newOptions: ISOMOptions
  ) => void;
  factors: string[];
  currentFactorIdx: number;
  onChangeFactor: (factorIdx: number) => void;
  loading?: boolean;
}

class SOMControlsBase extends React.Component<ISOMControlsProps> {
  private columnsInputRef = React.createRef<HTMLInputElement>();
  private rowsInputRef = React.createRef<HTMLInputElement>();
  private iterationsInputRef = React.createRef<HTMLInputElement>();
  private minLearningCoefInputRef = React.createRef<HTMLInputElement>();
  private maxLearningCoefInputRef = React.createRef<HTMLInputElement>();
  private minNeighborhoodInputRef = React.createRef<HTMLInputElement>();
  private maxNeighborhoodInputRef = React.createRef<HTMLInputElement>();

  protected getValueFromInputRef = ({
    current
  }: React.RefObject<HTMLInputElement>): number => {
    if (current) {
      const { value } = current;

      return Number(value);
    }

    return 0;
  };

  /**
   * uncontrolled form
   * get values from the each created reference
   */
  protected onSubmit = (event: React.FormEvent<EventTarget>) => {
    event.preventDefault();

    const columnsInputValue = this.getValueFromInputRef(this.columnsInputRef);

    const rowsInputValue = this.getValueFromInputRef(this.rowsInputRef);

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
      rows: rowsInputValue
    };

    const newOptions: ISOMOptions = {
      maxStep: iterationsInputValue,
      minLearningCoef: minLearningCoefInputRefValue,
      maxLearningCoef: maxLearningCoefInputRefValue,
      minNeighborhood: minNeighborhoodInputRefValue,
      maxNeighborhood: maxNeighborhoodInputRefValue
    };

    this.props.onSubmit(newDimensions, newOptions);
  };

  public render() {
    const {
      classes,
      loading,
      dimensions: { columns, rows },
      options: {
        maxStep,
        minLearningCoef,
        maxLearningCoef,
        minNeighborhood,
        maxNeighborhood
      },
      onChangeFactor,
      factors,
      currentFactorIdx,
      t
    } = this.props;

    return (
      <div className={classes.root}>
        <form autoComplete="off" onSubmit={this.onSubmit}>
          <Grid container={true} spacing={5}>
            <Grid item={true} xs={12} sm={3}>
              <Typography variant="body1">{t('controls.som.model')}</Typography>
              <Grid container={true} spacing={2}>
                <Grid item={true} xs={12} md={6}>
                  <Tooltip title={t('controls.som.hexagonsPerColumn')}>
                    <FormControl fullWidth={true}>
                      <InputLabel
                        required={true}
                        htmlFor="columns"
                        classes={{
                          root: classes.cssLabel,
                          focused: classes.cssFocused
                        }}
                      >
                        {t('columns')}
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
                  </Tooltip>
                </Grid>
                <Grid item={true} xs={12} md={6}>
                  <Tooltip title={t('controls.som.hexagonsPerRow')}>
                    <FormControl fullWidth={true}>
                      <InputLabel
                        htmlFor="rows"
                        required={true}
                        classes={{
                          root: classes.cssLabel,
                          focused: classes.cssFocused
                        }}
                      >
                        {t('rows')}
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
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>
            <Grid item={true} xs={12} sm={9}>
              <Typography variant="body1">{t('controls.som.training')}</Typography>
              <Grid container={true} spacing={2}>
                <Grid item={true} xs={12} sm={4} md={2}>
                  <Tooltip title={t('controls.som.maxStep')}>
                    <FormControl fullWidth={true}>
                      <InputLabel
                        htmlFor="steps"
                        required={true}
                        classes={{
                          root: classes.cssLabel,
                          focused: classes.cssFocused
                        }}
                      >
                        &lambda; {t('max')}
                      </InputLabel>
                      <Input
                        id="steps"
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
                  </Tooltip>
                </Grid>
                <Grid item={true} xs={6} sm={4} md={2}>
                  <Tooltip title={t('controls.som.minLearnCoef')}>
                    <FormControl fullWidth={true}>
                      <InputLabel
                        htmlFor="minLearningCoeff"
                        required={true}
                        classes={{
                          root: classes.cssLabel,
                          focused: classes.cssFocused
                        }}
                      >
                        &alpha; {t('min')}
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
                  </Tooltip>
                </Grid>
                <Grid item={true} xs={6} sm={4} md={2}>
                  <Tooltip title={t('controls.som.maxLearnCoef')}>
                    <FormControl fullWidth={true}>
                      <InputLabel
                        htmlFor="maxLearningCoefficient"
                        required={true}
                        classes={{
                          root: classes.cssLabel,
                          focused: classes.cssFocused
                        }}
                      >
                        &alpha; {t('max')}
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
                  </Tooltip>
                </Grid>
                <Grid item={true} xs={6} sm={4} md={2}>
                  <Tooltip title={t('controls.som.minNeighbor')}>
                    <FormControl fullWidth={true}>
                      <InputLabel
                        htmlFor="minNeighborhood"
                        required={true}
                        classes={{
                          root: classes.cssLabel,
                          focused: classes.cssFocused
                        }}
                      >
                        &theta; {t('min')}
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
                  </Tooltip>
                </Grid>
                <Grid item={true} xs={6} sm={4} md={2}>
                  <Tooltip title={t('controls.som.maxNeighbor')}>
                    <FormControl fullWidth={true}>
                      <InputLabel
                        htmlFor="maxNeighborhood"
                        required={true}
                        classes={{
                          root: classes.cssLabel,
                          focused: classes.cssFocused
                        }}
                      >
                        &theta; {t('max')}
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
                  </Tooltip>
                </Grid>
                <Grid item={true} xs={12} sm={4} md={2}>
                  <Grid container={true} spacing={2}>
                    <Grid item={true} xs={12}>
                      {!isEmpty(factors) && (
                        <FactorSelector
                          onChangeFactor={onChangeFactor}
                          currentFactorIdx={currentFactorIdx}
                          factors={factors}
                          disabled={loading}
                        />
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item={true} xs={12}>
              <Grid container={true} alignItems="center" spacing={2}>
                <Grid item={true} xs={6} sm={4} md={2}>
                  <div className={classes.wrapper}>
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      fullWidth={true}
                      type="submit"
                    >
                      {t('controls.som.train')}
                    </Button>
                    {loading && (
                      <CircularProgress
                        size={24}
                        className={classes.buttonProgress}
                      />
                    )}
                  </div>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </div>
    );
  }
}

export const SOMControls = compose<ISOMControlsProps, any>(
  withTranslation(),
  withStyles(styles),
)(SOMControlsBase);
