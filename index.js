const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const cache = {};

send404 = (response) => {
    response.writeHead(404, {'Content-Type':'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
};

sendFile = (response, filePath, fileContents) => {
    response.writeHead(200, {"content-Type" : mime.lookup(path.basename(filePath))});
    response.end(fileContents);
};

serveStatic = (response, cache, absPath) => {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, (exists) => {
            if (exists) {
                fs.readFile(absPath, (err,data) => {
                    if(err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else {
                send404(response);
            }
        });
    }
};

const server = http.createServer(function(request, response) {
    const filePath = (request.url === '/') ? 'public/index.html' : 'public' + request.url;
    const absPath = './' + filePath;

    serveStatic(response, cache, absPath);

});

server.listen(3000, function() {
    console.log("Server listening on port 3000.");
});

const chatServer = require('./lib/chat_server');
chatServer.listen(server);