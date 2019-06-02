import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import ViewCompactIcon from "@material-ui/icons/ViewCompact";
import React from "react";
import { useTranslation } from 'react-i18next';

interface IFilterComponentsButtonProps {
  onToggle: (e: React.MouseEvent<HTMLElement>) => void;
}

export const FilterComponentsButton: React.FC<IFilterComponentsButtonProps> = ({
  onToggle,
  ...restProps
}) => {
  const { t } = useTranslation();

  return (
    <Tooltip
      title={t('DXTable.onlyImportantComponents')}
      placeholder="bottom"
      enterDelay={300}
    >
      <IconButton onClick={onToggle} {...restProps}>
        <ViewCompactIcon />
      </IconButton>
    </Tooltip>
  );
};
