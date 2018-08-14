const express = require("express");
const morgan = require("morgan");
const routes = require("./src/routes");
const config = require("./src/config");

const app = express();
app.use(morgan("tiny"));
app.use("/", routes);

app.listen(config.port, config.bind, async function() {
    console.log(`ScreenshotServer listening ${config.bind} on port ${config.port}! Instances: ${config.maxInstances}`);
});
