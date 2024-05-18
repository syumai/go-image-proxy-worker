import "./wasm_exec.js";
import { connect } from 'cloudflare:sockets';

let mod;

globalThis.tryCatch = (fn) => {
  try {
    return {
      result: fn(),
    };
  } catch(e) {
    return {
      error: e,
    };
  }
}

export function init(m) {
  mod = m;
}

async function run(ctx) {
  const go = new Go();

  let ready;
  const readyPromise = new Promise((resolve) => {
    ready = resolve;
  });
  const instance = new WebAssembly.Instance(mod, {
    ...go.importObject,
    workers: {
      ready: () => { ready() }
    },
  });
  go.run(instance, ctx);
  await readyPromise;
}

function createRuntimeContext(env, ctx, binding) {
  return {
    env,
    ctx,
    connect,
    binding,
  };
}

export async function fetch(req, env, ctx) {
  const binding = {};
  await run(createRuntimeContext(env, ctx, binding));
  return binding.handleRequest(req);
}

export async function scheduled(event, env, ctx) {
  const binding = {};
  await run(createRuntimeContext(env, ctx, binding));
  return binding.runScheduler(event);
}

// onRequest handles request to Cloudflare Pages
export async function onRequest(ctx) {
  const binding = {};
  const { request, env } = ctx;
  await run(createRuntimeContext(env, ctx, binding));
  return binding.handleRequest(request);
}