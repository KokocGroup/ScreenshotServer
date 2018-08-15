const express = require("express");
const morgan = require("morgan");
const routes = require("./src/routes");
const config = require("./src/config");
const cluster = require("cluster");

if (cluster.isMaster) {
    const cpuCount = config.maxInstances || require("os").cpus().length;

    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }
    cluster.on("exit", function(worker) {
        console.log(`Worker ${worker.id} died :(`);
        cluster.fork();
    });
    cluster.on("online", worker => {
        console.log(`Worker ${worker.id} running`);
    });
} else {
    const app = express();
    app.use(morgan(":date[clf] :method :url :status :res[content-length] - :response-time ms"));
    app.use("/", routes);

    app.listen(config.port, config.bind, async function() {
        console.log(`ScreenshotServer listening ${config.bind} on port ${config.port}! Instances: ${config.maxInstances}`);
    });
}
