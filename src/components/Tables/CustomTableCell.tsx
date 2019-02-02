import { Theme, withStyles } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";

export const CustomTableCell = withStyles(({ palette }: Theme) => ({
  head: {
    backgroundColor: palette.primary.main,
    color: palette.common.white
  },
  body: {
    fontSize: 14
  }
}))(TableCell);
