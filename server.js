const express = require("express");
const morgan = require("morgan");
const routes = require("./src/routes");
const args = require("args");
const cluster = require("cluster");

args.option("port", "The port on which the app will be running", 3000);
args.option("bind", "The ip on which the app will be running", "127.0.0.1");
args.option("max-instances", "Max browser instances", 5);

const flags = args.parse(process.argv);

if (cluster.isMaster) {
    const cpuCount = flags.maxInstances || require("os").cpus().length;

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
    app.use(morgan("tiny"));
    app.use("/", routes);

    app.listen(flags.port, flags.bind, async function() {
        console.log(`ScreenshotServer listening ${flags.bind} on port ${flags.port}! Instances: ${flags.maxInstances}`);
    });
}
