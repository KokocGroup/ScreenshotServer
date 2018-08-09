const browserQueue = require("../browsers");
const _ = require("lodash");

module.exports = async (req, res) => {
    const target = req.query.url;
    const type = req.query.type || "jpeg";
    const quality = _.toInteger(req.query.quality) || 100;
    const fullPage = req.query.fullPage === "1" ? true : false;

    const task = {
        target,
        type,
        quality,
        fullPage
    };

    browserQueue.push(task, result => {
        res.status(200);
        res.contentType('image/jpeg');
        res.send(result);
    });
};
