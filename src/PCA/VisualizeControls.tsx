import Divider from "@material-ui/core/Divider";
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { Theme } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import ThreeSixtyIcon from "@material-ui/icons/ThreeSixty";
import { makeStyles } from "@material-ui/styles";
import map from "lodash/map";
import * as React from "react";

const useStyles = makeStyles(({ spacing }: Theme) => ({
  root: {
    flexGrow: 1
  },
  button: {
    marginTop: spacing.unit,
    marginBottom: spacing.unit
  },
  formControl: {
    marginRight: spacing.unit,
    minWidth: 120
  },
  divider: {
    marginBottom: spacing.unit * 2
  }
}));

interface IVisualizeControlsProps {
  components: string[];
  selectedComponents: {
    x: number;
    y: number;
  };
  onChange: (selectedComponents: { x: number; y: number }) => void;
}

export const VisualizeControls: React.FC<IVisualizeControlsProps> = ({
  components,
  selectedComponents,
  onChange
}) => {
  const classes = useStyles();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const { name, value } = event.target;

    onChange({ ...selectedComponents, [name]: value });
  };

  function onSwap(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    onChange({ x: selectedComponents.y, y: selectedComponents.x });
  };

  return (
    <div className={classes.root}>
      <form className={classes.root} autoComplete="off">
        <Grid container={true} spacing={16}>
          <Grid item={true} xs={6} sm={4} md={3} lg={2}>
            <FormControl fullWidth={true} className={classes.formControl}>
              <InputLabel htmlFor="x">Axis X</InputLabel>
              <Select
                value={selectedComponents.x}
                onChange={handleChange}
                disabled={components.length === 2}
                inputProps={{
                  name: "x",
                  id: "x"
                }}
              >
                {map(components, (name, i) => i !== selectedComponents.y && (
                  <MenuItem key={i} value={i}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item={true} xs={6} sm={4} md={3} lg={2}>
            <FormControl fullWidth={true} className={classes.formControl}>
              <InputLabel htmlFor="y">Axis Y</InputLabel>
              <Select
                value={selectedComponents.y}
                onChange={handleChange}
                disabled={components.length === 2}
                inputProps={{
                  name: "y",
                  id: "y"
                }}
              >
                {map(components, (name, i) => i !== selectedComponents.x && (
                  <MenuItem key={i} value={i}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item={true} xs={12} sm={4} md={3} lg={2}>
            <Hidden smUp={true}>
              <Divider />
            </Hidden>
            <Tooltip title="Swap axes">
              <IconButton
                aria-label="Swap"
                onClick={onSwap}
                className={classes.button}
              >
                <ThreeSixtyIcon />
              </IconButton>
            </Tooltip>
            <Hidden smUp={true}>
              <Divider />
            </Hidden>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};
