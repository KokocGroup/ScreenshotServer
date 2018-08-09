const express = require("express");
const morgan = require("morgan");
const routes = require("./src/routes");
const args = require("args");

args.option("port", "The port on which the app will be running", 3000);
args.option("max-instances", "Max browser instances", 5);

const flags = args.parse(process.argv);

const app = express();
app.use(morgan("tiny"));
app.use("/", routes);

app.listen(flags.port, async function() {
    console.log(`ScreenshotServer listening on port ${flags.port}!`);
});
