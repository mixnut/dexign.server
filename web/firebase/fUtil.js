var firebase = require("firebase");
const controller = require("../controller");
var admin = require("firebase-admin");
var adminConfig = require("../key/serviceAccountKey.json");
var config = require('../key/serviceAccountKeyForClient.json');

const dexign_admin = admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
    databaseURL: "https://dexign-7dea4.firebaseio.com"
});
const dexign_app = firebase.initializeApp(config);
const db = dexign_app.database();
const auth = dexign_app.auth();
const fileRef = function(filetype){
    return db.ref('/'+filetype);
}
const userRef = function(){
    return db.ref('users/');
}
const projectsRef = function(uid,guid){
    return userRef().child(uid).child('projects/').child(guid);
}
const createUser = function(_email,_password,_userName,_GUID,_role,res){
        dexign_app.auth().createUserWithEmailAndPassword(_email, _password)
            .then(function (userRecord) {
                if(_role=='d') { //개발자가 dexign app 가입
                    dexign_app.auth().currentUser.sendEmailVerification()
                        .then(function (result) {
                            var _createDate = new Date().toISOString().slice(0, 10);

                            userRef().child(userRecord.uid).set({
                                userName: _userName,
                                createDate: _createDate
                            }, function (err) {
                                if (err) {
                                    res.json({status: "failed", message: err.message});
                                } else {
                                    controller.insertUser(res, _userName, _email, userRecord.uid, _GUID, _role, _createDate);
                                }
                            });

                        }, function (err) {
                            res.json({status: "failed", message: err.message});
                        });
                }else{ //client 가입
                    controller.selectUidFromProject(_GUID,function(err,result){
                        if(!err){
                            if(result!=null){
                                var _createDate = new Date().toISOString().slice(0, 10);
                                userRef().child(result).child('projects').child(_GUID).child('data').child('client').child(userRecord.uid)
                                    .set({
                                    userName: _userName,
                                    createDate: _createDate
                                }, function (err) {
                                    if (err) {
                                        res.json({status: "failed", message: err.message});
                                    } else {
                                        controller.insertUserForClient(res, _userName, _email, userRecord.uid, _GUID, _role, _createDate);
                                    }
                                });
                            }
                            else
                                res.json({status:"failed"});
                        }
                        else{
                            res.json({status:"failed", message:err.message});
                        }
                    });
                }
            })
            .catch(function (err) {
                if (err.code == 'auth/email-already-in-use') {
                    res.json({status: "success", data: {status: "already-in-use"}});
                } else {
                    res.json({status: "failed", message: err.message});
                }
            });
}
const deleteUser = function(res, uid){
    dexign_admin.auth().deleteUser(uid)
        .then(function() {
            userRef().child(uid).remove();
            controller.deleteUser(res, uid);
        })
        .catch(function(err) {
            res.json({status:"failed", message:err.message});
        });
}
const deleteUserRef = function(){
    userRef().remove();
}
const resetPassword = function(_email,res){
    dexign_app.auth().sendPasswordResetEmail(_email)
        .then(function() {
            res.json({status:"success", message:"send password reset email"});
        })
        .catch(function(err) {
            res.json({status:"success", data:{status:"failed"}, message:err.message});
        });
}
module.exports = {
    auth,
    dexign_app,
    db,
    fileRef,
    userRef,
    projectsRef,
    createUser,
    deleteUser,
    deleteUserRef,
    resetPassword
};
