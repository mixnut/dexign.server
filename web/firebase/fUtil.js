var firebase = require("firebase");
const controller = require("../controller");

var config = require('../key/serviceAccountKeyForClient.json');;
const dexign_app = firebase.initializeApp(config);
const db = dexign_app.database();
const auth = dexign_app.auth();
const fileRef = function(filetype){
    return db.ref('/'+filetype);
}
const userRef = function(){
    return db.ref('user/');
}
const createUser = function(_email,_password,_userName,_role,res){
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
                            res.json("{status : error, message:"+error+"}");
                        } else {
                            controller.insertUser(res, _userName,_email,userRecord.uid,null,_role,_createDate);
                        }
                    });
                },function(err){
                    res.json("{status : error, message:"+error+"}");
                });
        })
        .catch(function(error) {
            if(error.code=='auth/email-already-in-use'){
                res.json('{status:already-in-use}');
            }else{
                res.json("{status : error, message:"+error+"}");
            }
        });
}
module.exports = {
    auth,
    dexign_app,
    db,
    fileRef,
    userRef,
    createUser
};