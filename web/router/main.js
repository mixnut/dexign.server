/**
 * Created by daemin Hwnag on 2017-01-10.
 */
const express = require('express');
const router = express.Router();
const controller = require("../controller");
const fileUtil = require('../lib/fileUtil');
const fUtil = require('../firebase/fUtil');
const async = require("async");

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

router.route('/user')
    .get(function (req, res, next) {
        res.json('{success:'+next+'}');
    })
    .post(function (req, res, next) {
        fUtil.createUser(req.body.email,req.body.password,req.body.userName,req.body.GUID,req.body.role,res);
    })
    .delete(function (req, res, next){
        controller.checkToken(req.body.uid, function(err,result){
            if(!err){
                fUtil.deleteUser(res,req.body.uid);
            }
            else{
                res.json('{status:error, message:'+err+'}');
            }
        });
    });


router.post("/signup", function (req,res){
    fUtil.auth.signInWithEmailAndPassword(req.body.email, req.body.password)
        .then(function(user) {
            var uid = user.uid;
            if(user.emailVerified){
                controller.checkToken(uid, function(err,result){
                    if(!err){
                        if(result=='live') {
                            res.json('{status:live, uid:'+uid+'}');
                        }
                        else if(result=='ready'){
                            controller.updateUser(res, uid);
                        }
                        else{
                            res.json('{status:deleted, uid:'+uid+'}');
                        }
                    }
                    else{
                        res.json('{status:error, message:'+err+'}');
                    }
                });
            }else{
                res.json('{status: ready}');
            }
        })
        .catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            if (errorCode === 'auth/wrong-password') {
                res.json('{status:error, message: wrong passwrod}');
            } else {
                res.json('{status:error, message:'+error+'}');
            }
            console.log(error);
        });
});

router.put("/password", function (req,res){
    fUtil.resetPassword(req.body.email,res);
});

router.route('/project')
    .get(function (req, res, next) {
        res.json('{success:'+next+'}');
    })
    .post(function (req, res, next) {
        controller.insertProject(res, req.body.projectName, req.body.packageName, req.body.version, req.body.uid ,req.body.GUID, req.body.bucketUsage, "live", new Date().toISOString().slice(0,10));
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
                res.json('{status:error, message:'+error+'}')
            } else {
                res.json('{success:Data saved successfully}')
            }
        });
    }else{
        res.json("{status:error, message:not found file")
    }
    });

module.exports = router;