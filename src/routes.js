const Router = require("express").Router();
const views = require("./views");

Router.get("/screenshot/", views.screenshot);

module.exports = Router;
