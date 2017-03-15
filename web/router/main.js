/**
 * Created by daemin Hwnag on 2017-01-10.
 */
var express = require('express');
var router = express.Router();
var controller = require("../controller");

router.get("/test", function (req, res) {
    controller.search(req,res)
});

module.exports = router;