import { generateGrid, Kohonen } from "@seracio/kohonen";

const ctx: Worker = self as any;

ctx.addEventListener("message", (event: MessageEvent) => {
  const { data, cols, rows } = event.data;
  const neurons = generateGrid(cols, rows);
  const k = new Kohonen({ data, neurons });

  console.log(k); // tslint:disable-line

  ctx.postMessage({
    neurons
  });
});
