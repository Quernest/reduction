import CSV from '../../../utils/csv';

self.addEventListener('message', async (ev) => {
  const { data } = ev;

  const fr = new FileReader();

  fr.readAsText(data);

  fr.onload = () => {
    const { result } = fr;

    const parsedCSV = CSV.parse(result);

    postMessage(parsedCSV);
  };

  fr.onerror = error => postMessage(error);
});
