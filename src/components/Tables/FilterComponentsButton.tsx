import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import ViewCompactIcon from "@material-ui/icons/ViewCompact";
import React, { MouseEvent } from "react";

interface IProps {
  onToggle: (e: MouseEvent<HTMLElement>) => void;
}

export const FilterComponentsButton = ({ onToggle, ...restProps }: IProps) => {
  return (
    <Tooltip
      title="Show only important columns"
      placeholder="bottom"
      enterDelay={300}
    >
      <IconButton onClick={onToggle} {...restProps}>
        <ViewCompactIcon />
      </IconButton>
    </Tooltip>
  );
};
