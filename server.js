const express = require("express");
const morgan = require("morgan");
const routes = require("./src/routes");
const config = require("./src/config");

const app = express();
app.use(morgan(":date[clf] :method :url :status :res[content-length] - :response-time ms"));
app.use("/", routes);

app.listen(config.port, config.bind, async function() {
    console.log(`ScreenshotServer listening ${config.bind} on port ${config.port}! Instances: ${config.maxInstances}`);
});
