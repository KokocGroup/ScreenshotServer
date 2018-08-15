const asyncWrap = require("../utils").asyncWrap;
const browserPool = require("../utils").browserPool;
const _ = require("lodash");

module.exports = async (req, res) => {
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

    let browser = null;
    let factoryInstance = null;
    let image = null;
    let error = null;
    let closeBrowserTimeout = null;

    console.log("GET TASK: ", task);

    try {
        factoryInstance = await browserPool.acquire();

        browser = await factoryInstance.getBrowser();
        const page = await browser.newPage();
        await page.viewport({
            width: width,
            height: height
        });
        await page.evaluateOnNewDocument(function() {
            navigator.geolocation.getCurrentPosition = function(cb) {
                setTimeout(() => {
                    cb({
                        coords: {
                            accuracy: 21,
                            altitude: null,
                            altitudeAccuracy: null,
                            heading: null,
                            latitude: 23.129163,
                            longitude: 113.264435,
                            speed: null
                        }
                    });
                }, 1000);
            };
        });

        closeBrowserTimeout = setTimeout(async () => {
            if (factoryInstance) {
                await factoryInstance.close();
            }
        }, waitFor + timeout + 10000);
        await page.goto(task.target, { waitUntil: waitUntil, timeout: timeout });
        await page.waitFor(waitFor);
        image = await page.screenshot({
            fullPage: fullPage,
            omitBackground: true,
            type: type,
            quality: quality
        });
        clearTimeout(closeBrowserTimeout);
    } catch (e) {
        error = e;
    } finally {
        try {
            if (factoryInstance) {
                await factoryInstance.close();
                await browserPool.release(factoryInstance);
            }
            if (closeBrowserTimeout) {
                clearTimeout(closeBrowserTimeout);
            }
        } catch (e) {
            error = e;
            console.log("ERROR: ", task.target, " ", _.toString(e));
            console.trace("ERROR");
        }
    }
    if (image) {
        res.status(200)
            .contentType("image/jpeg")
            .send(image);
    } else {
        res.status(400).json({
            error: _.toString(error)
        });
    }
};
