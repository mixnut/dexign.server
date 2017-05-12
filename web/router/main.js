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
        res.json({success:'get'+next});
    })
    .post(function (req, res, next) {
        res.json({success:'post'+next});
    });
router.get('/debug/delete', function (req, res, next) {
    fUtil.deleteUserRef();
    controller.deleteAll(res);
});

router.route('/user')
    .get(function (req, res, next) {
        res.json({status:"success", data:{status:''+next}});
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
                res.json({status:"success", data:{status:"failed"}, message:err.message});
            }
        });
    });


router.post("/signup", function (req,res){
    fUtil.auth.signInWithEmailAndPassword(req.body.email, req.body.password)
        .then(function(user) {
            var _uid = user.uid;
            if(user.emailVerified){
                controller.checkToken(_uid, function(err,result){
                    if(!err){
                        if(result=='success') {
                            controller.getUserName(_uid,function(err,result){
                                res.json({status:"success", data:{status:"success", uid:_uid, username:result}});
                            });
                        }
                        else if(result=='pending'){
                            controller.getUserName(_uid,function(err,result){
                                controller.updateUser(res, _uid, result);
                            });

                        }
                        else{
                            res.json({status:"success", data:{status:"deleted"}});
                        }
                    }
                    else{
                        res.json({status:"success", data:{status:"failed"}, message:err.message});
                    }
                });
            }else{
                res.json({status:"success", data:{status: "pending", uid:_uid}});
            }
        })
        .catch(function(err) {
            // Handle errs here.
            var errCode = err.code;
            if (errCode === 'auth/wrong-password') {
                res.json({status:"success", data:{status:"failed"}, message:err.message});
            } else {
                res.json({status:"success", data:{status:"failed"}, message:err.message});
            }
            console.log(err);
        });
});

router.put("/password", function (req,res){
    fUtil.resetPassword(req.body.email,res);
});

router.route('/project')
    .get(function (req, res, next) {
        res.json({status:"success", data:{status:''+next}});
    })
    .post(function (req, res, next) {
        controller.insertProject(res, req.body.projectName, req.body.packageName, req.body.version, req.body.uid ,req.body.GUID, req.body.bucketUsage, "success", new Date().toISOString().slice(0,10));
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
        }, function(err) {
            if (err) {
                res.json({status:"success", data:{status:"failed"}, message:err.message});
            } else {
                res.json({status:"success", message:"Data saved successfully"})
            }
        });
    }else{
        res.json({status:"failed", message:"not found file"})
    }
    });

module.exports = router;