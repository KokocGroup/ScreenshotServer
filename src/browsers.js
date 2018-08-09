const async = require("async");
const puppeteer = require("puppeteer");

const queue = async.queue((task, cb) => {
    console.log(task);

    (async () => {
        const browser = await puppeteer.launch({
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
        const page = await browser.newPage();
        await page.goto(task.target);
        const image = await page.screenshot({
            fullPage: task.fullPage,
            type: task.type,
            quality: task.quality
        });

        await browser.close();
        cb(image);
    })();
}, 5);

module.exports = queue;
