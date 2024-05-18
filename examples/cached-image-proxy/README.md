# cached-image-proxy

- An example worker which caches response from go-image-proxy-worker.

## Example

https://cached-image-proxy.syumai.com/?file=curry.jpg&size=500&format=jpeg

### Available options

* file
  - syumai.png (small PNG)
  - curry.jpg (middle-sized JPEG)
  - akiba.jpg (large JPEG)
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
