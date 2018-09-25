const createPuppeteerPool = require("./pool");
const config = require("./config");

const browserPool = createPuppeteerPool({
    max: config.maxInstances,
    min: 0,
    maxUses: 10,
    evictionRunIntervalMillis: 3000,
    idleTimeoutMillis: 3000,
    puppeteerArgs: {
        headless: true,
        ignoreHTTPSErrors: true,
        args: [
            "--no-sandbox", 
            "--disable-setuid-sandbox", 
            "--disable-dev-shm-usage", 
            "--disable-dev-profile",
            "--disable-setuid-sandbox",
            "--disable-background-networking",
            "--disable-default-apps",
            "--ignore-certificate-errors",
            "--disable-extensions",
            "--disable-sync",
            "--disable-translate",
            "--hide-scrollbars",
            "--metrics-recording-only",
            "--mute-audio",
            "--safebrowsing-disable-auto-update",
            "--disable-gpu",
            "--disable-notifications",
            "--disable-search-geolocation-disclosure",
            "--disable-web-security",
            "--disable-dev-profile"
        ]
    }
});

module.exports = {
    browserPool
};
