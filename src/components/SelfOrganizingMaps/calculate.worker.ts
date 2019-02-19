import { Kohonen } from "@seracio/kohonen";

const ctx: Worker = self as any;

ctx.addEventListener("message", (event: MessageEvent) => {
  const k = new Kohonen(event.data);

  k.training();

  ctx.postMessage({ positions: k.mapping() });
});
