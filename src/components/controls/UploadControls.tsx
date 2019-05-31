import { Theme } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import { makeStyles } from "@material-ui/styles";
import { useTranslation } from 'react-i18next';

import React from "react";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1
  },
  rightIcon: {
    marginLeft: theme.spacing(1)
  },
  chip: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  buttonWrapper: {
    position: "relative"
  },
  buttonProgress: {
    color: theme.palette.primary.main,
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  }
}));

interface IUploadControlsProps {
  file?: File;
  uploading?: boolean;
  onChange: (chosenFile?: File, error?: string) => void;
  onUpload: () => void;
  onCancel: () => void;
}

export const UploadControls: React.FC<IUploadControlsProps> = ({
  uploading,
  onUpload,
  onCancel,
  onChange,
  file
}) => {
  const classes = useStyles();
  const fileInput: React.RefObject<HTMLInputElement> = React.createRef();
  const { t } = useTranslation();

  function onChoose(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    const input = fileInput.current;

    if (input) {
      input.click();
    }
  }

  function onChangeFile(event: React.ChangeEvent<HTMLInputElement>) {
    const files: FileList | null = event.target.files;

    if (files) {
      const chosenFile = files.item(0);

      if (chosenFile) {
        /**
         * list of accepted file extensions
         */
        const exts: string[] = [".txt", ".csv"];

        /**
         * chosen file extension
         */
        const ext: string = chosenFile.name.substring(
          chosenFile.name.lastIndexOf(".")
        );

        // return the error if it's not accepted extension
        if (exts.indexOf(ext) < 0) {
          onChange(
            undefined,
            `invalid file selected, valid files are of [${exts.toString()}] types.`
          );
        } else {
          onChange(chosenFile);
        }
      } else {
        onChange(undefined, "getting file error");
      }

      // reset input
      // to be able to upload the same file again if it was canceled
      event.target.value = "";
    }
  }

  return (
    <div className={classes.root}>
      <input
        ref={fileInput}
        onChange={onChangeFile}
        type="file"
        multiple={false}
        hidden={true}
        accept=".csv, .txt"
      />
      <Grid container={true} alignItems="center" spacing={2}>
        <Grid item={true} xs={6} sm={4} md={3} lg={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={onChoose}
            disabled={uploading}
            fullWidth={true}
          >
            {t('controls.upload.button.choose')}
          </Button>
        </Grid>
        <Grid item={true} xs={6} sm={4} md={3} lg={2}>
          <div className={classes.buttonWrapper}>
            <Button
              variant="contained"
              color="primary"
              disabled={!file || uploading}
              onClick={onUpload}
              fullWidth={true}
            >
              {t('controls.upload.button.upload')}
              <CloudUploadIcon className={classes.rightIcon} />
            </Button>
            {uploading && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </div>
        </Grid>
        <Grid item={true} xs={12}>
          {file && !uploading && (
            <Chip
              label={file.name}
              onDelete={onCancel}
              className={classes.chip}
            />
          )}
        </Grid>
      </Grid>
    </div>
  );
};
