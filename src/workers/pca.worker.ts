import forEach from "lodash/forEach";
import map from "lodash/map";
import unzip from "lodash/unzip";
import { IDatasetRequiredColumnsIndexes, IFilePreview } from "../models";
// @ts-ignore
import PCA from "ml-pca";
import Matrix from "ml-matrix";
import { DatasetService } from "../services";

const ctx: Worker = self as any;

interface IEventData {
  datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes;
  filePreview: IFilePreview;
}

ctx.addEventListener(
  "message",
  (event: MessageEvent) => {
    const { datasetRequiredColumnsIdxs, filePreview }: IEventData = event.data;

    try {
      const dataset = new DatasetService(
        filePreview,
        datasetRequiredColumnsIdxs
      ).generate();

      const unzippedDataset = unzip(dataset.values);
      const PCAOptions = { scale: true, center: true };
      const pca = new PCA(unzippedDataset, PCAOptions);
      const explainedVariance: number[] = pca.getExplainedVariance();
      const cumulativeVariance: number[] = pca.getCumulativeVariance();
      const adjustedDataset: Matrix = pca._adjust(unzippedDataset, PCAOptions);
      const loadings: Matrix = pca.getLoadings();
      const predictions: Matrix = pca.predict(unzippedDataset);
      const eigenvalues: number[] = pca.getEigenvalues();
      const components = map(eigenvalues, (_, i) => `PC${++i}`);
      const importantComponents: string[] = [];

      forEach(eigenvalues, (eig, i) => {
        if (eig >= 1) {
          importantComponents[i] = components[i];
        }
      });

      ctx.postMessage({
        dataset,
        explainedVariance,
        cumulativeVariance,
        loadings: loadings.to2DArray(),
        predictions: unzip(predictions.to2DArray()),
        eigenvalues,
        components,
        importantComponents,
        adjustedDataset: unzip(adjustedDataset.to2DArray())
      });
    } catch (error) {
      ctx.postMessage({ error: error.message });
    }
  },
  false
);
