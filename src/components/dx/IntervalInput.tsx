import IconButton from "@material-ui/core/IconButton";
import Input from "@material-ui/core/Input";
import Tooltip from "@material-ui/core/Tooltip";
import ClearIcon from "@material-ui/icons/Clear";
import LinearScaleIcon from "@material-ui/icons/LinearScale";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  input: {
    maxWidth: 70
  }
});

interface IIntervalInputProps {
  onOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onClose: (e: React.MouseEvent<HTMLElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  interval: number;
  isOpen: boolean;
}

export const IntervalInput: React.FC<IIntervalInputProps> = ({
  onOpen,
  onClose,
  onChange,
  interval,
  isOpen
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  if (isOpen) {
    return (
      <>
        <IconButton onClick={onClose}>
          <ClearIcon />
        </IconButton>
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
      </>
    );
  }

  return (
    <Tooltip
      title={t('DXTable.showValuesInInterval')}
      placeholder="bottom"
      enterDelay={300}
    >
      <IconButton onClick={onOpen}>
        <LinearScaleIcon />
      </IconButton>
    </Tooltip>
  );
};
