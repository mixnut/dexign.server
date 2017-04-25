/**
 * Created by daemin Hwnag on 2017-01-10.
 */
const express = require('express');
const router = express.Router();
const controller = require("../controller");
const fileUtil = require('../lib/fileUtil');
const fUtil = require('../firebase/fUtil');

router.get('/', function (req, res, next) {
    res.render('index');
});
router.get("/test", function (req, res) {
    controller.search(req, res);
});
router.post('/files/:filetype', fileUtil.multer.single('file'),
    fileUtil.sendUploadToGCS,
    (req, res, next) => {
    let data = req.body;

    if (req.file && req.file.cloudStoragePublicUrl) {
        fUtil.fileRef(req.params.filetype).push().set({
            filename : req.file.cloudStorageObject,
            url : req.file.cloudStoragePublicUrl
        }, function(error) {
            if (error) {
                res.json('{err:'+error+'}')
            } else {
                res.json('{success:Data saved successfully}')
            }
        });
    }else{
        res.json("{err:not found file")
    }
});
router.get("/files/:filetype", function (req, res) {

    fUtil.fileRef(req.params.filetype).once("value", function(snapshot) {
        res.json(snapshot.val());
    })
});
router.post("/user", function (req,res){
    fUtil.createUser(req.body.email,req.body.password,req.body.userName,res);
});

module.exports = router;