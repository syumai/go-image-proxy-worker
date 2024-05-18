import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { etag } from "hono/etag";
import { z } from "zod";
import type { ImageProxy, ParseOptions } from "@syumai/go-image-proxy-worker";

type Bindings = {
  IMAGE_PROXY: Service<ImageProxy>;
};

const app = new Hono<{ Bindings: Bindings }>();

const schema = z.object({
  file: z.union([
    z.literal("syumai.png"),
    z.literal("curry.jpg"),
  ]),
  size: z.preprocess((x) => Number(x), z.number()).optional(),
  format: z
    .union([z.literal("jpeg"), z.literal("png"), z.literal("tiff")])
    .optional(),
});

app.get(
  "/",
  zValidator("query", schema, (result, c) => {
    if (!result.success) {
      return c.text("Bad Request", 400);
    }
  }),
  etag({ weak: true }),
  cache({
    cacheName: "cached-image-proxy",
    cacheControl: "public, max-age=14400",
  }),
  async (c) => {
    const data = c.req.valid("query");

    const opts: ParseOptions = {};
    if (data.size !== undefined) {
      opts.size = data.size;
      opts.fit = true;
    }
    if (data.format !== undefined) {
      opts.format = data.format;
    }
    const proxyRes = await c.env.IMAGE_PROXY.proxy(
      new URL(c.req.url).origin,
      `https://r2-image-viewer.syumai.com/${data.file}`,
      opts
    );

    c.header(
      "Content-Type",
      proxyRes.headers.get("Content-Type") ?? "application/octet-stream"
    );
    return c.body(proxyRes.body);
  }
);

export default app;
