var http = require('http'),
  httpProxy = require('http-proxy');
//
// Create your proxy server
//
var proxy = httpProxy.createProxyServer({});

var server = http.createServer(function (req, res) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  console.log(req.url);
  if (req.url.indexOf("google") > -1) {
    res.write("{}");
    res.end();
  } else {
    proxy.web(req, res, {
      target: req.url
    });
  }
});

console.log("listening on port 5050");
server.listen(5050);