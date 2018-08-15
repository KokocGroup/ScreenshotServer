const createPuppeteerPool = require("./pool");

const browserPool = createPuppeteerPool({
    max: 2,
    min: 0,
    puppeteerArgs: {
        headless: false,
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
