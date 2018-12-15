// @flow
import React from 'react';
import {
  Button, IconButton, Typography, withStyles,
} from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import styles from '../styles';

type Props = {
  classes: Object,
  onFileUpload: () => void,
  onFileSelectInputChange: () => void,
  onFileCancel: () => void,
  multiple: boolean,
  file: File,
};

const UploadControls = ({
  classes,
  onFileUpload,
  onFileSelectInputChange,
  onFileCancel,
  multiple,
  file,
}: Props) => {
  const fileInput: ?HTMLInputElement = React.createRef();

  return (
    <div className={classes.uploadControls}>
      <Button
        variant="contained"
        color="primary"
        size="large"
        className={classes.button}
        onClick={() => fileInput.current.click()}
        // disabled={uploading || !isNull(selectedFile)}
      >
        Pick csv file
      </Button>
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        onClick={onFileUpload}
        // disabled={uploading || isNull(selectedFile)}
      >
        Upload
        <CloudUploadIcon className={classes.rightIcon} />
      </Button>
      <input
        ref={fileInput}
        style={{ display: 'none' }}
        type="file"
        onChange={onFileSelectInputChange}
        multiple={multiple}
        hidden
      />
      {file && (
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
