import IconButton from "@material-ui/core/IconButton";
import {
  createStyles,
  StyleRules,
  Theme,
  withStyles
} from "@material-ui/core/styles";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import LastPageIcon from "@material-ui/icons/LastPage";
import * as React from "react";

interface IProps {
  classes?: any;
  count: number;
  onChangePage: (event: any, page: number) => void;
  page: number;
  rowsPerPage: number;
  theme: Theme;
}

class TablePaginationActions extends React.Component<IProps> {
  public render() {
    const { classes, count, page, rowsPerPage, theme } = this.props;

    return (
      <div className={classes.root}>
        <IconButton
          onClick={this.handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="First Page"
        >
          {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={this.handleBackButtonClick}
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
          onClick={this.handleNextButtonClick}
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
          onClick={this.handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Last Page"
        >
          {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </div>
    );
  }
  private handleFirstPageButtonClick = (event: any): void => {
    this.props.onChangePage(event, 0);
  };

  private handleBackButtonClick = (event: any): void => {
    this.props.onChangePage(event, this.props.page - 1);
  };

  private handleNextButtonClick = (event: any): void => {
    this.props.onChangePage(event, this.props.page + 1);
  };

  private handleLastPageButtonClick = (event: any): void => {
    this.props.onChangePage(
      event,
      Math.max(0, Math.ceil(this.props.count / this.props.rowsPerPage) - 1)
    );
  };
}

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      flexShrink: 0,
      color: theme.palette.text.secondary,
      marginLeft: theme.spacing.unit * 2.5
    }
  });

export const TablePaginationActionsWrapped = withStyles(styles, {
  withTheme: true
})(TablePaginationActions);
