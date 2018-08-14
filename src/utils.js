const puppeteer = require("puppeteer");
const genericPool = require("generic-pool");
const config = require("./config");

const asyncWrap = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

class BrowserFactory {
    constructor() {
        this.browser = null;
    }

    async getBrowser() {
        await this.close();
        this.browser = await puppeteer.launch({
            headless: true,
            ignoreHTTPSErrors: true,
            args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--disable-background-networking",
                "--disable-default-apps",
                "--disable-extensions",
                "--disable-sync",
                "--disable-translate",
                "--hide-scrollbars",
                "--metrics-recording-only",
                "--mute-audio",
                "--safebrowsing-disable-auto-update"
            ]
        });
        return this.browser;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
        this.browser = null;
    }
}

const browserPool = genericPool.createPool(
    {
        create: async () => {
            return new BrowserFactory();
        },
        destroy: async browser => {
            await browser.close();
        },
        validator: () => Promise.resolve(false)
    },
    {
        max: config.maxInstances,
        min: 0,
        maxWaitingClients: config.maxInstances,
        acquireTimeoutMillis: 10000
    }
);

module.exports = {
    asyncWrap,
    browserPool
};
