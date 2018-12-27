// @flow
import React from 'react';
import MaterialTable from 'material-table';
import { withStyles } from '@material-ui/core/styles';
// lodash helpers
import map from 'lodash/map';
import keys from 'lodash/keys';
import head from 'lodash/head';
// icons
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import NextPage from '@material-ui/icons/KeyboardArrowRight';
import PreviousPage from '@material-ui/icons/KeyboardArrowLeft';

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
          NextPage,
          PreviousPage,
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
