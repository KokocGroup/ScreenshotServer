const express = require("express");
const morgan = require("morgan");
const http = require('http');
const routes = require("./src/routes");
const config = require("./src/config");

const app = express();
app.use(morgan("combined"));
app.use("/", routes);

server = http.createServer(app)
server.maxConnections = config.maxInstances * 2

server.listen(config.port, config.bind, async function() {
    console.log(`ScreenshotServer listening ${config.bind} on port ${config.port}! Instances: ${config.maxInstances}. Max connections: ${server.maxConnections}`);
});
