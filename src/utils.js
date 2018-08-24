const createPuppeteerPool = require("./pool");
const config = require("./config");

const browserPool = createPuppeteerPool({
    max: config.maxInstances,
    min: 0,
    maxUses: 10,
    puppeteerArgs: {
        headless: true,
        ignoreHTTPSErrors: true,
        userDataDir: __dirname + "/../chrome_data/",
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
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
            "--single-process",
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
