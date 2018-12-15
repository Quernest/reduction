// @flow
import React from 'react';
import {
  Button, IconButton, Typography, withStyles,
} from '@material-ui/core';
import { isNull } from 'lodash';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import styles from '../styles';

type Props = {
  classes: Object,
  onFileUpload: () => void,
  onFileSelectInputChange: () => void,
  onFileCancel: () => void,
  uploaded: boolean,
  uploading: boolean,
  multiple: boolean,
  file: File,
};

const UploadControls = ({
  classes,
  onFileUpload,
  onFileSelectInputChange,
  onFileCancel,
  uploaded,
  uploading,
  multiple,
  file,
}: Props) => {
  const fileInput: ?HTMLInputElement = React.createRef();
  const hasFile: boolean = !isNull(file);

  if (uploaded) {
    return null;
  }

  return (
    <div className={classes.uploadControls}>
      <Button
        variant="contained"
        color="primary"
        size="large"
        className={classes.button}
        onClick={() => fileInput.current.click()}
        disabled={uploading || hasFile}
      >
        select csv file
      </Button>
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        onClick={onFileUpload}
        disabled={uploading || !hasFile}
      >
        upload
        <CloudUploadIcon className={classes.rightIcon} />
      </Button>
      <input
        ref={fileInput}
        style={{ display: 'none' }}
        type="file"
        onChange={(e) => {
          console.log('works');
          onFileSelectInputChange(e);
        }}
        multiple={multiple}
        hidden
      />
      {!uploading && hasFile && (
        <div className={classes.file}>
          <Typography variant="body2">
            {file.name}
            <IconButton aria-label="delete" className={classes.margin} onClick={onFileCancel}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Typography>
        </div>
      )}
    </div>
  );
};

export default withStyles(styles)(UploadControls);
