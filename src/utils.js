const createPuppeteerPool = require("./pool");
const config = require("./config");

const browserPool = createPuppeteerPool({
    max: config.maxInstances,
    min: 0,
    maxUses: 50,
    puppeteerArgs: {
        headless: true,
        ignoreHTTPSErrors: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-dev-profile"]
    }
});

module.exports = {
    browserPool
};
