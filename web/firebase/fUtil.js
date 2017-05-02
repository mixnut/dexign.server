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
    return db.ref('user/');
}
const createUser = function(_email,_password,_userName,_GUID,_role,res){
    dexign_app.auth().createUserWithEmailAndPassword(_email,_password)
        .then(function(userRecord) {
            dexign_app.auth().currentUser.sendEmailVerification()
                .then(function(result){
                    var _createDate = new Date().toISOString().slice(0,10);
                    userRef().child(userRecord.uid).set({
                        userName: _userName,
                        createDate:  _createDate
                    }, function(error) {
                        if (error) {
                            res.json("{status:error, message:"+error+"}");
                        } else {
                            controller.insertUser(res, _userName,_email,userRecord.uid,_GUID,_role,_createDate);
                        }
                    });
                },function(err){
                    res.json("{status:error, message:"+error+"}");
                });
        })
        .catch(function(error) {
            if(error.code=='auth/email-already-in-use'){
                res.json('{status:already-in-use}');
            }else{
                res.json("{status:error, message:"+error+"}");
            }
        });
}
const deleteUser = function(res, uid){
    dexign_admin.auth().deleteUser(uid)
        .then(function() {
            userRef().child(uid).remove();
            controller.deleteUser(res, uid);
        })
        .catch(function(error) {
            res.json("{status:error, message:"+error+"}");
        });
}
const resetPassword = function(_email,res){
    dexign_app.auth().sendPasswordResetEmail(_email)
        .then(function() {
            res.json("{status:success, message:send password reset email}");
        })
        .catch(function(error) {
                res.json("{status:error, message:"+error+"}");
        });
}
module.exports = {
    auth,
    dexign_app,
    db,
    fileRef,
    userRef,
    createUser,
    deleteUser,
    resetPassword
};