import { Kohonen } from "@seracio/kohonen";
import { Neuron } from "@seracio/kohonen/dist/types";

const ctx: Worker = self as any;

ctx.addEventListener("message", (event: MessageEvent) => {
  const k = new Kohonen(event.data);
  // const queue: Array<{ neurons: Neuron[]; step: number }> = [];

  // let prev: Neuron[] = [];

  k.training((neurons: Neuron[], step: number) => {
    // console.log(neurons, prev);
    // if (step % 20 === 0) {
    //   console.log(k.topographicError());
    //   console.log(k.quantizationError());
    // }
    // queue.push({ neurons, step });
  });

  // for (let i: number = 0; i < queue.length; i++) {
  //   ((j: number) => setTimeout(() => ctx.postMessage(queue[j]), 1000 * j))(i);
  // }

  const positions = k.mapping();
  const umatrix = k.umatrix();
  const { neurons } = k;

  ctx.postMessage({ positions, umatrix, neurons });
});
