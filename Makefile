.PHONY: dev
dev:
	npx wrangler dev

.PHONY: build
build:
	GOOS=js GOARCH=wasm go build -o ./build/app.wasm .

.PHONY: deploy
deploy:
	npx wrangler deploy
