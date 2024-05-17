# go-image-proxy-worker

- A Cloudflare Worker application which serves patched version of [imageproxy](https://github.com/willnorris/imageproxy).
- This proxy worker supports:
    - Resizing image
    - Cropping image
    - Convert image to jpeg / png
- Caching is not supported.

## Usage

- Clone this repo and run dev server.
- Open URLs with supported [ParseOptions](https://pkg.go.dev/willnorris.com/go/imageproxy#ParseOptions).
  - e.g. http://localhost:8787/600,fit,jpg,q80/https://r2-image-viewer.syumai.com/akiba.jpg

## Requirements

This project requires these tools to be installed globally.

- wrangler
- go

## Development

### Commands

```
make dev    # run dev server
make build  # build Go Wasm binary
make deploy # deploy worker
```

## Author

syumai

## License

MIT
