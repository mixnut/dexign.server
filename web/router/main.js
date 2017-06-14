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

router.post("/user/validation", function (req,res) {
    controller.checkToken(req.body.uid, function(err,result){
        if(!err){
            console.log(result);
            if(result=="success")
                res.json({status:"success"});
            else
                res.json({status:"failed"});
        }
        else{
            res.json({status:"failed", message:err.message});
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
                        res.json({status:"success", data:{status:"failed"}});
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
        var _projectName = req.body.projectName;
        var _version = req.body.version;
        var _createDate = new Date().toISOString().slice(0,10);
        fUtil.projectsRef(req.body.uid, req.body.GUID).update({
            projectName: _projectName,
            version: _version,
            createDate: _createDate
        }, function(err) {
            if (err) {
                res.json({status:"failed", message:err.message});
            } else {
                controller.insertProject(res, _projectName, req.body.packageName, _version, req.body.uid ,req.body.GUID, req.body.bucketUsage, "success", _createDate);
            }
        });
    });

router.route('/lambdas')
    .get(function (req, res, next) {
        controller.listLambdas(res);
    })
    .post(function (req, res, next) {
        controller.insertLambda(res, req.body.email, req.body.name, req.body.code, req.body.parameters, new Date().toISOString().slice(0,10));
    })
    .put(function (req, res, next) {
        controller.updateLambda(res, req.body.email, req.body.name, req.body.code,req.body.parameters);
    })
    .delete(function (req, res, next) {
        controller.deleteLambda(res, req.body.email, req.body.name);
    });

function readLambda(email, name, _variable, res){
    controller.readLambda(email, name, function(err,results){
        if(!err){
            if(results!=null) {
                console.log(email+name+_variable)
                console.log(results)
                eval(results[0].code);
                var name = results[0].name;
                var parameters = (results[0].parameters).split(",");
                var variable = _variable;
                var executeCode = name + "(";
                for (var i = 0; i < parameters.length; i++) {
                    if (i == parameters.length - 1)
                        executeCode += variable[parameters[i]];
                    else
                        executeCode += variable[parameters[i]] + ',';
                }
                try {
                    res.send(eval(executeCode + ")") + '')
                }catch(exception){
                    res.json({status:"faild", message:"The function name of the argument differs from the function name of the code, or other exception conditions."});
                }
            }else{
                res.json({status:"faild", message:"can not find the function."});
            }
        }
        else{
            res.json({status:"faild"});
        }
    });
}
router.route('/lambda/:email/:name')
    .get(function (req, res, next) {
        readLambda(req.params.email, req.params.name,req.query, res)
    })
    .post(function (req, res, next) {
        readLambda(req.params.email, req.params.name,req.body, res)
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
        var _url = req.file.cloudStoragePublicUrl;
        fUtil.fileRef(req.params.filetype).push().set({
            filename : req.file.cloudStorageObject,
            url : _url
        }, function(err) {
            if (err) {
                res.json({status:"success", data:{status:"failed"}, message:err.message});
            } else {
                res.json({status:"success", data:{url:_url}, message:"Data saved successfully"})
            }
        });
    }else{
        res.json({status:"failed", message:"not found file"})
    }
    });

module.exports = router;