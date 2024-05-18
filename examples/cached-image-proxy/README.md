# cached-image-proxy

- An example worker which caches response from go-image-proxy-worker.

## Example

https://cached-image-proxy.syumai.com/?file=curry.jpg&size=500&format=jpeg

### Available options

* file
  - [syumai.png](https://r2-image-viewer.syumai.com/syumai.png) (small PNG)
  - [curry.jpg](https://r2-image-viewer.syumai.com/curry.jpg) (middle-sized JPEG)

* size
  - number
* format
  - jpeg
  - png
  - tiff

## Development

* At first, please run `npm i`.

### Commands

```
npm run dev    # run dev server
npm run deploy # deploy worker
```

## Note

* large size image exceeds memory limit and currently not works.
  - [akiba.jpg](https://r2-image-viewer.syumai.com/akiba.jpg) (large JPEG)

