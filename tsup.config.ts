import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["worker/index.ts"],
  splitting: true,
  sourcemap: true,
  clean: true,
  format: ["cjs", "esm"],
  external: ["cloudflare:workers", "cloudflare:sockets", "./app.wasm"],
  dts: {
    banner: '/// <reference types="@cloudflare/workers-types" />',
  },
});
