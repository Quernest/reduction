/**
 * type definitions for the "compute-covariance" module
 * https://github.com/compute-io/covariance
 */

declare module "compute-covariance" {
  function cov(
    matrix: number[][],
    options?: { bias: boolean }
  ): number[][];

  export = cov;
}
