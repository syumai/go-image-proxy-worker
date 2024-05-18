import "./wasm_exec.js";
import { connect } from "cloudflare:sockets";
// @ts-ignore
import mod from "./app.wasm";

declare const Go: any;

Object.defineProperty(globalThis, "tryCatch", {
  value: (fn: () => void) => {
    try {
      return {
        result: fn(),
      };
    } catch (e) {
      return {
        error: e,
      };
    }
  },
  writable: false,
});

async function run(ctx: ReturnType<typeof createRuntimeContext>) {
  const go = new Go();

  let ready: (v?: unknown) => void;
  const readyPromise = new Promise((resolve) => {
    ready = resolve;
  });
  const instance = new WebAssembly.Instance(mod, {
    ...go.importObject,
    workers: {
      ready: () => {
        ready();
      },
    },
  });
  go.run(instance, ctx);
  await readyPromise;
}

type Env = {};

// Bindings for syumai/workers
type Binding = {
  handleRequest?: (req: Request) => Promise<Response>;
};

function createRuntimeContext(
  env: Env,
  ctx: ExecutionContext,
  binding: Binding
) {
  return {
    env,
    ctx,
    connect,
    binding,
  };
}

export default {
  async fetch(
    req: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const binding: Binding = {};
    await run(createRuntimeContext(env, ctx, binding));
    return binding.handleRequest!(req);
  },
};
