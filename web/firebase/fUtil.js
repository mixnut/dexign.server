//const admin = require("firebase-admin");
var firebase = require("firebase");
/*const dexign_app = firebase.initializeApp({
    credential: admin.credential.cert(require("../auth/serviceAccountKey.json")),
    databaseURL: "https://dexign-7dea4.firebaseio.com/"
});*/
var config = require('../auth/serviceAccountKeyForClient.json');;
const dexign_app = firebase.initializeApp(config);

const db = dexign_app.database();

const fileRef = function(filetype){
    return db.ref('/'+filetype);
}
const userRef = function(){
    return db.ref('user/');
}
const createUser = function(_email,_password,_userName,res){
    dexign_app.auth().createUserWithEmailAndPassword(_email,_password)
        .then(function(userRecord) {
            userRef().child(userRecord.uid).set({
                userName: _userName,
                joinDate:  new Date().toISOString().slice(0,10)
            }, function(error) {
                if (error) {
                    res.json("{error:"+error+"}");
                } else {
                    res.json("{status:success, uid:"+userRecord.uid+"}");
                }
            });
        })
        .catch(function(error) {
            if(error.code=='auth/email-already-in-use'){
                res.json('{status:already-in-use}');
            }else{
                res.json("{error:"+error+"}");
            }
        });
}
module.exports = {
    db,
    fileRef,
    userRef,
    createUser
};