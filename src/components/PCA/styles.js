export default theme => ({
  root: {
    padding: 20,
  },
  grid: {
    [theme.breakpoints.up('lg')]: {
      width: 1170,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  title: {
    marginBottom: 16,
  },
  content: {
    marginTop: 16,
    marginBottom: 16,
  },
  linearProgress: {
    marginTop: 16,
    marginBottom: 16,
  },
  button: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
  file: {},
  margin: {
    margin: theme.spacing.unit,
  },
  marginLeft: {
    marginLeft: theme.spacing.unit,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  charts: {
    marginTop: 20,
    marginBottom: 20,
  },
});
