import PCA from "./pca";

const ctx: Worker = self as any;

ctx.addEventListener(
  "message",
  event => {
    const { data } = event;

    const pca = new PCA(data);

    const {
      covariance,
      analysis,
      points,
      eigens,
      linearCombinations,
      adjustedDataset,
      names
    } = pca;

    const calculations = {
      covariance,
      analysis,
      points,
      eigens,
      linearCombinations,
      adjustedDataset,
      names
    };

    ctx.postMessage(calculations);
  },
  false
);

// Expose the right type when imported via worker-loader.
// export default {} as typeof Worker & { new (): Worker };
