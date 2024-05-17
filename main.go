package main

import (
	"net/http"

	"github.com/syumai/imageproxy"
	"github.com/syumai/tinyutil/httputil"
	"github.com/syumai/workers"
)

func main() {
	mux := http.NewServeMux()
	mux.Handle("/favicon.ico", http.NotFoundHandler())
	mux.Handle("/", imageproxy.NewProxy(httputil.DefaultClient.Transport, nil))
	workers.Serve(mux)
}
