// @flow
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import isNull from 'lodash/isNull';
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
        className={`${classes.button} ${classes.marginLeft}`}
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
        onChange={onFileSelectInputChange}
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
