import { IParsedCSV, IPCA, IPCACalculations } from "src/models";
import { PCA } from "./pca";

const ctx: Worker = self as any;

ctx.addEventListener(
  "message",
  (event: MessageEvent) => {
    const { values }: IParsedCSV = event.data;

    const pca: IPCA = new PCA(values);

    const {
      dataset,
      covariance,
      analysis,
      eigens,
      linearCombinations,
      adjustedDataset
    } = pca;

    const calculations: IPCACalculations = {
      dataset,
      analysis,
      covariance,
      eigens,
      linearCombinations,
      adjustedDataset
    };

    ctx.postMessage(calculations);
  },
  false
);
