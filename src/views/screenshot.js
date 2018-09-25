const asyncWrap = require("../utils").asyncWrap;
const browserPool = require("../utils").browserPool;
const _ = require("lodash");

module.exports = (req, res) => {
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
        timeout,
        width,
        height
    };

    browserPool
        .use(async browser => {
            let image = null;

            const page = await browser.newPage();
            try {
                await page.viewport({
                    width: width,
                    height: height
                });

                page.on("error", async error => {
                    console.log("Page crashed: ", error);
                    await page.close();
                    throw Error(error);
                });

                const status = await page.goto(task.target, { timeout: timeout, waitUntil: "load" });
                if (status.ok) {
                    throw new Error(`cannot open ${task.target}`);
                }

                image = await page.screenshot({
                    fullPage: fullPage,
                    type: type,
                    quality: quality
                });
            } catch (error) {
                throw error;
            } finally {
                await page.close();
            }
            return image;
        })
        .then(
            image => {
                res.status(200)
                    .contentType("image/jpeg")
                    .send(image);
            },
            error => {
                res.status(400).json({
                    error: _.toString(error)
                });
            }
        );
};
