const args = require("args");

args.option("port", "The port on which the app will be running", 3000);
args.option("bind", "The ip on which the app will be running", "127.0.0.1");
args.option("max-instances", "Max browser instances", 5);

const flags = args.parse(process.argv);

module.exports = {
    ...flags
};
