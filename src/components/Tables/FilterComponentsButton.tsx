import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import FilterListIcon from "@material-ui/icons/FilterList";
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
        <FilterListIcon />
      </IconButton>
    </Tooltip>
  );
};
