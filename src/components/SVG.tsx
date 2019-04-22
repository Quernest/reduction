import React from "react";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  root: {
    position: "relative",
    height: 0,
    width: "100%",
    padding: 0 // reset
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%"
  }
});

export interface ISVGProps {
  id: string;
  width: number;
  height: number;
}

/**
 * responsive SVG wrapper
 */
export const SVG: React.FC<ISVGProps> = ({ id, width, height }) => {
  const classes = useStyles();
  const ratio = (height / width) * 100;

  return (
    <div className={classes.root} style={{ paddingBottom: `${ratio}%` }}>
      <svg
        id={id}
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMinYMin meet"
        className={classes.svg}
      />
    </div>
  );
};
