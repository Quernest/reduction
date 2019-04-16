import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import ViewCompactIcon from "@material-ui/icons/ViewCompact";
import * as React from "react";

interface IFilterComponentsButtonProps {
  onToggle: (e: React.MouseEvent<HTMLElement>) => void;
}

export const FilterComponentsButton: React.FC<IFilterComponentsButtonProps> = ({ onToggle, ...restProps }) => {
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
