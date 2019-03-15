import Input from "@material-ui/core/Input";
import { Theme } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/styles";
import React from "react";

const useStyles = makeStyles(({ spacing }: Theme) => ({
  input: {
    maxWidth: 70,
    marginRight: spacing.unit,
    marginLeft: spacing.unit
  }
}));

interface IProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  interval: number;
}

export const IntervalInput = ({ interval, onChange, ...restProps }: IProps) => {
  const classes = useStyles();

  return (
    <Tooltip
      title="Show values in absolute interval"
      placeholder="bottom"
      enterDelay={300}
    >
      <Input
        type="number"
        onChange={onChange}
        value={interval}
        inputProps={{
          "aria-label": "interval",
          min: "0",
          max: "1",
          step: "0.1"
        }}
        className={classes.input}
        placeholder="interval"
      />
    </Tooltip>
  );
};
