export default theme => ({
  wrap: {
    padding: 20,
  },
  headline: {
    marginBottom: 16,
  },
  grid: {
    [theme.breakpoints.up('lg')]: {
      width: 1170,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
});
