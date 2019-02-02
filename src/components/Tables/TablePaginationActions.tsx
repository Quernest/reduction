import IconButton from "@material-ui/core/IconButton";
import { Theme } from "@material-ui/core/styles";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import LastPageIcon from "@material-ui/icons/LastPage";
import { makeStyles, useTheme } from "@material-ui/styles";
import * as React from "react";

interface IProps {
  count: number;
  onChangePage: (event: any, page: number) => void;
  page: number;
  rowsPerPage: number;
}

const useStyles = makeStyles(({ palette, spacing }: Theme) => ({
  root: {
    flexShrink: 0,
    color: palette.text.secondary,
    marginLeft: spacing.unit * 2.5
  }
}));

export const TablePaginationActions = ({
  count,
  onChangePage,
  page,
  rowsPerPage
}: IProps): JSX.Element => {
  const classes = useStyles();
  const theme: Theme = useTheme();

  function handleFirstPageButtonClick(event: any): void {
    onChangePage(event, 0);
  }

  function handleBackButtonClick(event: any): void {
    onChangePage(event, page - 1);
  }

  function handleNextButtonClick(event: any): void {
    onChangePage(event, page + 1);
  }

  function handleLastPageButtonClick(event: any): void {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  }

  return (
    <div className={classes.root}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="First Page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="Previous Page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="Next Page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="Last Page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  );
};
