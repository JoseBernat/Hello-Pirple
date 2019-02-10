/*
 *
 *This will be the primary file for the app
 *
 *
 *
 */

//Dependencies:
var http = require('http');
var https = require('https');
var url = require('url');
var stringDecoder = require('string_decoder').StringDecoder
var config = require('./config')
var fs = require('fs')



//The server should respond to all requirements with a JSON:

var httpServer = http.createServer(function (req, res) {
    unifiedServer(req, res);
});

//Start server, and have it listen on port 3000:

httpServer.listen(config.httpPort, function () {
    console.log('Server now listening on port ' + config.httpPort + ' in ' + config.envName + ' mode');
});

//Instantiate HTTPS server:
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function (req, res) {
    unifiedServer(req, res);
});


//Start https server:
httpsServer.listen(config.httpsPort, function () {
    console.log('Server now listening on port ' + config.httpsPort + ' in ' + config.envName + ' mode');
});



//All the server logic for both http and https servers:
var unifiedServer = function (req, res) {
    //Get requested path and parse it:
    var parsedUrl = url.parse(req.url, true);

    //Get the path:
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //Get query string as an object:
    var queryStringObject = parsedUrl.query

    //Get http method:
    var method = req.method.toLowerCase();

    //Get haders:
    var headers = req.headers;

    //Get payload, if any:
    var decoder = new stringDecoder('utf-8');
    var buffer = '';

    req.on('data', function (data) {
        buffer += decoder.write(data);
    });

    req.on('end', function () {
        buffer += decoder.end();

        //Choose the handler this request should go to, defaullt to not found:
        var chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        //construct data object to send to handler:
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        }

        //Route the request to handler specified in router:

        chosenHandler(data, function (statusCode, payload) {
            //Use status code called back by handler or default to 200
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            //Use payload called back by the handler or default to an emty object:
            payload = typeof (payload) == 'object' ? payload : {};

            //Convert payload t oa string:
            var payloadString = JSON.stringify(payload)

            //Send response:
            res.setHeader('Content-type', 'application/json')
            res.writeHead(statusCode)
            res.end(payloadString);



            console.log('Returnng this response ', statusCode, payloadString)

        })

    });


}

//Define handlers:
var handlers = {};

//sample handler:
handlers.hello = function (data, callback) {
    //Get current date:
    var date = new Date;
    //callback a http status code and a payload object
    callback(200, {
        'hello': 'Simple Hello World API',
        'request received on: ': data.trimmedPath,
        'at: ': date,
        'with headers: ': data.headers,
        'queries: ': data.queryStringObject,
        'using method: ': data.method,
        'payload: ': data.payload
    });

};

//Not found handler: 
handlers.notFound = function (data, callback) {
    callback(404)

};


//Define a request router:
var router = {
    'hello': handlers.hello
}