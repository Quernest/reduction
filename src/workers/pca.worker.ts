import forEach from "lodash/forEach";
import map from "lodash/map";
import filter from 'lodash/filter';
import unzip from "lodash/unzip";
import {
  IDatasetRequiredColumnsIndexes,
  IParsedFile,
  Dataset
} from "../models";
import { PCA } from "ml-pca";

const ctx: Worker = self as any;

interface IEventData {
  datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes;
  parsedFile: IParsedFile;
}

ctx.addEventListener(
  "message",
  (event: MessageEvent) => {
    const { datasetRequiredColumnsIdxs, parsedFile }: IEventData = event.data;

    try {
      const dataset = new Dataset(parsedFile, datasetRequiredColumnsIdxs);
      const unzippedValues = unzip(dataset.values);

      // creates new PCA (Principal Component Analysis) from the dataset
      const pca = new PCA(unzippedValues, { scale: true, center: true, ignoreZeroVariance: true });

      // @ts-ignore
      const adjustedDataset: number[][] = filter(dataset.values, (xs, i) => pca.excludedFeatures.indexOf(i) === -1)
        // @ts-ignore
        .map((xs, i) => {
          // @ts-ignore
          return map(xs, x => (x - pca.means[i]) / pca.stdevs[i])
        });

      /**
       * proportion of variance for each component
       */
      const explainedVariance = pca.getExplainedVariance();

      /**
       * the cumulative proportion of variance
       */
      const cumulativeVariance = pca.getCumulativeVariance();

      /**
       * loadings matrix
       */
      const loadings = pca.getLoadings();

      /**
       * project the dataset into the PCA space
       */
      const predictions = pca.predict(unzippedValues);

      /**
       * eigenvalues (on the diagonal)
       */
      const eigenvalues = pca.getEigenvalues();

      /**
       * collection of component names
       */
      const components = map(eigenvalues, (_, i) => `PC${++i}`);

      /**
       * components that have eigenvalues ​​above 1
       */
      const importantComponents: string[] = [];

      forEach(eigenvalues, (eig, i) => {
        if (eig >= 1) {
          importantComponents[i] = components[i];
        }
      });

      ctx.postMessage({
        dataset,
        adjustedDataset,
        explainedVariance,
        cumulativeVariance,
        loadings: loadings.to2DArray(),
        predictions: unzip(predictions.to2DArray()),
        eigenvalues,
        components,
        importantComponents
      });
    } catch (error) {
      ctx.postMessage({ error: error.message });
    }
  },
  false
);
