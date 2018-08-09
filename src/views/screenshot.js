const puppeteer = require("puppeteer");
const asyncWrap = require("../utils").asyncWrap;
const _ = require("lodash");

module.exports = asyncWrap(async (req, res) => {
    const target = req.query.url;
    const type = req.query.type || "jpeg";
    const quality = _.toInteger(req.query.quality) || 100;
    const fullPage = req.query.fullPage === "1" ? true : false;
    const waitUntil = req.query.waitUntil || "domcontentloaded";
    const timeout = _.toInteger(req.query.timeout) || 5 * 1000;
    const waitFor = _.toInteger(req.query.waitFor) || 5 * 1000;
    const width = _.toInteger(req.query.width) || 1280;
    const height = _.toInteger(req.query.height) || 720;

    const task = {
        target,
        type,
        quality,
        fullPage,
        waitUntil,
        waitFor,
        timeout
    };

    console.log("start ", task);
    let browser = null;

    try {
        browser = await puppeteer.launch({
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
        await page.viewport({
            width: width,
            height: height
        });
        await page.goto(task.target, { waitUntil: waitUntil, timeout: timeout });
        await page.waitFor(waitFor);
        const image = await page.screenshot({
            fullPage: fullPage,
            type: type,
            quality: quality
        });
        res.status(200);
        res.contentType("image/jpeg");
        res.send(image);
    } catch (error) {
        res.status(400);
        res.json({
            error: _.toString(error)
        });
    }

    await browser.close();
});
