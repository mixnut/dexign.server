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
router.route('/test')
    .get(function (req, res, next) {
        res.json('{success:get'+next+'}');
    })
    .post(function (req, res, next) {
        res.json('{success:post'+next+'}');
    });

router.post("/user", function (req,res){
    fUtil.createUser(req.body.email,req.body.password,req.body.userName,req.body.role,res);
});

router.post("/signup", function (req,res){
    fUtil.auth.signInWithEmailAndPassword(req.body.email, req.body.password)
        .then(function(user) {
            if(user.emailVerified){
                res.json('{status: live, uid:'+user.uid+'}');
            }else{
                res.json('{status: ready}');
            }
        })
        .catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') {
                res.json('{status : error, message: wrong passwrod}');
            } else {
                res.json('{status : error, message:'+errorMessage+'}');
            }
            console.log(error);
        });
});

router.route('/files/:filetype')
    .get(function (req, res) {
        fUtil.fileRef(req.params.filetype).once("value", function(snapshot) {
            res.json(snapshot.val());
        });
    })
    .post(fileUtil.multer.single('file'),
    fileUtil.sendUploadToGCS,
    (req, res, next) => {
    let data = req.body;

    if (req.file && req.file.cloudStoragePublicUrl) {
        fUtil.fileRef(req.params.filetype).push().set({
            filename : req.file.cloudStorageObject,
            url : req.file.cloudStoragePublicUrl
        }, function(error) {
            if (error) {
                res.json('{status : error, message:'+error+'}')
            } else {
                res.json('{success:Data saved successfully}')
            }
        });
    }else{
        res.json("{status : error, message:not found file")
    }
    });

module.exports = router;