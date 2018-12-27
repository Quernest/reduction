// @flow
import React from 'react';
import MaterialTable from 'material-table';
import { withStyles, Paper } from '@material-ui/core';
import { keys, head, map } from 'lodash';
import {
  FirstPage, LastPage, KeyboardArrowLeft, KeyboardArrowRight,
} from '@material-ui/icons';

type Props = {
  classes: Object,
  dataset: Array<Object>,
};

function DatasetTable({ classes, dataset }: Props) {
  const columns = ['№', ...keys(head(dataset))].map(
    (element: string, index: number): Object => ({
      cellStyle:
        index === 0
          ? {
            width: 30,
          }
          : undefined,
      title: element,
      field: element,
      type: 'numeric',
    }),
  );

  const data: Array<Object> = map(
    dataset,
    (element: Object, index: number): Object => ({
      '№': index + 1,
      ...element,
    }),
  );

  return (
    <div className={classes.root}>
      <MaterialTable
        title="Dataset"
        icons={{
          FirstPage,
          LastPage,
          NextPage: KeyboardArrowRight,
          PreviousPage: KeyboardArrowLeft,
        }}
        options={{ search: false, sorting: false, toolbar: false }}
        columns={columns}
        data={data}
      />
    </div>
  );
}

const styles = (theme: Object): Object => ({
  root: {
    marginTop: 16,
    marginBottom: 16,
  },
});

export default withStyles(styles)(DatasetTable);
