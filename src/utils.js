const puppeteer = require("puppeteer");
const genericPool = require("generic-pool");
const child_process = require("child_process");

const asyncWrap = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

class BrowserFactory {
    constructor() {
        this.browser = null;
        this.pid = null;
    }

    async getBrowser() {
        await this.close();
        this.browser = await puppeteer.launch({
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
        });

        this.pid = this.browser.process().pid;
        this.browser.on(
            "disconnected",
            () => {
                setTimeout(() => {
                    child_process.exec(`kill -9 ${this.pid}`, (error, stdout, stderr) => {
                        if (error) {
                            console.log(`Process Kill Error: ${error}`);
                        }
                    });
                });
            },
            100
        );

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
        max: 2,
        min: 0,
        maxWaitingClients: 2,
        acquireTimeoutMillis: 10000
    }
);

module.exports = {
    asyncWrap,
    browserPool
};
