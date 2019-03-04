import { Breakpoint } from "@material-ui/core/styles/createBreakpoints";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import MUIDataTable from "mui-datatables";
import { MUIDataTableProps } from "mui-datatables";
import React from "react";

interface IProps extends MUIDataTableProps {
  width: Breakpoint;
}

const MUIDataTableWrapper = ({
  title,
  data,
  columns,
  options,
  width
}: IProps) => {
  if (isWidthUp("sm", width)) {
    return (
      <MUIDataTable
        title={title}
        data={data}
        columns={columns}
        options={{
          ...options,
          responsive: "scroll"
        }}
      />
    );
  }

  return (
    <MUIDataTable
      title={title}
      data={data}
      columns={columns}
      options={{
        ...options,
        responsive: "stacked"
      }}
    />
  );
};

export const MUIResponsiveDataTable = withWidth()(MUIDataTableWrapper);
