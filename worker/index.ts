import "./wasm_exec.js";
import { connect } from "cloudflare:sockets";
// @ts-ignore
import mod from "./app.wasm";
import { WorkerEntrypoint } from "cloudflare:workers";

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

async function fetch(req: Request, env: Env, ctx: ExecutionContext) {
  const binding: Binding = {};
  await run(createRuntimeContext(env, ctx, binding));
  return binding.handleRequest!(req);
}

export default {
  fetch,
};

type Size = number | `${number}` | "fit";

export type ParseOptions = {
  /**
   * X coordinate of top left rectangle corner (default: 0)
   */
  cropX?: number;
  /**
   * Y coordinate of top left rectangle corner (default: 0)
   */
  cropY?: number;
  /**
   * rectangle width (default: image width)
   */
  cropWidth?: number;
  /**
   * rectangle height (default: image height)
   */
  cropHeight?: number;
  /**
   * The "sc" option will perform a content-aware smart crop to fit the requested image width and height dimensions.
   * The smart crop option will override any requested rectangular crop.
   */
  smartCrop?: boolean;
  /**
   * The size option takes the general form "{width}x{height}", where width and height are numbers. Integer values greater than 1 are interpreted as exact pixel values.
   * Floats between 0 and 1 are interpreted as percentages of the original image size.
   * If either value is omitted or set to 0, it will be automatically set to preserve the aspect ratio based on the other dimension.
   * If a single number is provided (with no "x" separator), it will be used for both height and width.
   * Depending on the size options specified, an image may be cropped to fit the requested size.
   * In all cases, the original aspect ratio of the image will be preserved; imageproxy will never stretch the original image.
   * When no explicit crop mode is specified, the following rules are followed:
   * - If both width and height values are specified, the image will be scaled to fill the space, cropping if necessary to fit the exact dimension.
   * - If only one of the width or height values is specified, the image will be resized to fit the specified dimension, scaling the other dimension as needed to maintain the aspect ratio.
   * If the "fit" option is specified together with a width and height value, the image will be resized to fit within a containing box of the specified size. As always, the original aspect ratio will be preserved. Specifying the "fit" option with only one of either width or height does the same thing as if "fit" had not been specified.
   */
  size?: `${Size}x${Size}` | `x${Size}` | `${Size}x` | Size;
  /**
   * The "r{degrees}" option will rotate the image the specified number of degrees, counter-clockwise.
   * Valid degrees values are 90, 180, and 270.
   */
  rotationDegrees?: 90 | 180 | 270;
  /**
   * The "q{qualityPercentage}" option can be used to specify the quality of the output file (JPEG only).
   * If not specified, the default value of "95" is used.
   */
  quality?: number;
  /**
   * The "jpeg", "png", and "tiff" options can be used to specify the desired image format of the proxied image.
   */
  format?: "jpeg" | "png" | "tiff";
  /**
   * The "s{signature}" option specifies an optional base64 encoded HMAC used to sign the remote URL in the request. The HMAC key used to verify signatures is provided to the imageproxy server on startup.
   */
  signature?: string;
};

function convertParseOptions(opts: ParseOptions): string {
  const parts: string[] = [];
  if (opts.cropX !== undefined) {
    parts.push(`cx${opts.cropX}`);
  }
  if (opts.cropY !== undefined) {
    parts.push(`cy${opts.cropY}`);
  }
  if (opts.cropWidth !== undefined) {
    parts.push(`cw${opts.cropWidth}`);
  }
  if (opts.cropHeight !== undefined) {
    parts.push(`ch${opts.cropHeight}`);
  }
  if (opts.smartCrop !== undefined) {
    parts.push("sc");
  }
  if (opts.size !== undefined) {
    parts.push(String(opts.size));
  }
  if (opts.rotationDegrees !== undefined) {
    parts.push(`r${opts.rotationDegrees}`);
  }
  if (opts.quality !== undefined) {
    parts.push(`q${opts.quality}`);
  }
  if (opts.format !== undefined) {
    parts.push(opts.format);
  }
  if (opts.signature !== undefined) {
    parts.push(`s${opts.signature}`);
  }
  return parts.join(",");
}

export class ImageProxy extends WorkerEntrypoint<Env> {
  async fetch(req: Request) {
    return await fetch(req, this.env, this.ctx);
  }
  async proxy(baseUrl: string, imageUrl: string | URL, opts: ParseOptions) {
    const url = new URL(`${convertParseOptions(opts)}/${imageUrl}`, baseUrl);
    return await fetch(new Request(url, { method: "GET" }), this.env, this.ctx);
  }
}
