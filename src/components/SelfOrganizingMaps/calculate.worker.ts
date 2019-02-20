import { Kohonen } from "@seracio/kohonen";
import { Neuron } from "@seracio/kohonen/dist/types";

const ctx: Worker = self as any;

ctx.addEventListener("message", (event: MessageEvent) => {
  const k = new Kohonen(event.data);
  // const queue: Array<{ neurons: Neuron[]; step: number }> = [];

  k.training((neurons: Neuron[], step: number) => {
    // queue.push({ neurons, step });
  });

  // for (let i: number = 0; i < queue.length; i++) {
  //   ((j: number) => setTimeout(() => ctx.postMessage(queue[j]), 25 * j))(i);
  // }

  const positions = k.mapping();
  const umatrix = k.umatrix();

  ctx.postMessage({ positions, umatrix, neurons: k.neurons });
});
