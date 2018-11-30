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
  btnCalculate: {},
  btnPlot: {},
  btnDownload: {
    marginLeft: 16,
  },
  dropZoneText: {
    margin: 16,
  },
  dropZoneWrap: {
    marginTop: 8,
    marginBottom: 8,
  },
  dropZone: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    height: '200px',
    border: '2px dashed #333',
    borderRadius: '3px',
    [theme.breakpoints.up('sm')]: {
      border: '1px dashed #333',
      borderRadius: '5px',
      width: '280px',
      height: '180px',
    },
  },
  activeDropZone: {
    border: '2px solid green',
  },
  rejectedDropZone: {
    border: '2px solid red',
  },
});
