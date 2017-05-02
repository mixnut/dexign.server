/**
 * Created by daemin Hwang on 2017-01-10.
 */

var pool = require("../lib/db_pool");
var mysql = require("mysql");

exports.checkToken = function(uid, callback){
    pool.getConnection(function(err,conn){
        if (err) {
            conn.release();
            return;
        }
        var sql = "SELECT status FROM token WHERE token=?"
        var param = [uid];
        sql = mysql.format(sql,param);
        conn.query(sql,function(err,results){
            conn.release();
            if(err) {
                callback(err,null);
            }else{
                if(results.length > 0){
                    callback(null,results[0].status);
                }else{
                    callback(null,null);
                }

            }
        });
        conn.on('error', function(err) {
            callback(err,null);
            conn.release();
            return;
        });
    });
};

exports.insertUser = function(res, name, email, uid, GUID, role, createDate){
    pool.getConnection(function(err,conn){
        if (err) {
            console.log(err);
            conn.release();
            return;
        }
        var sql1 = [
            "INSERT INTO user SET ",
            "name=?",
            ",email=?",
            ",uid=?",
            ",GUID=?",
            ",role=?",
            ",status=?",
            ",createDate=?; "
            ].join('');
        var param1 = [name,email,uid,GUID,role,"ready",createDate];
        sql1 = mysql.format(sql1,param1);

        var sql2 = [
            "INSERT INTO token SET ",
            "token=?",
            ",status=?",
            ",createDate=?;"
        ].join('');
        var param2 = [uid,"ready",createDate];
        sql2 = mysql.format(sql2,param2);

        var sql3;
        var param3;
        if(role=="c"){
            sql3 = [
                "INSERT INTO apps SET ",
                "uid=?",
                ",GUID=?",
                ",role=?;"
            ].join('');
            var param3 = [uid,GUID,"c"];
            sql3 = mysql.format(sql3,param3);
        }
        else sql3 ="";
        conn.query(sql1+sql2+sql3, [1,2],function(err,result){
            conn.release();
            if(!err) {
                res.json("{status:ready}");
            }
        });
        conn.on('error', function(err) {
            console.log(err);
            conn.release();
            return;
        });
    });
};

exports.updateUser = function(res, uid){
    pool.getConnection(function(err,conn){
        if (err) {
            console.log(err);
            conn.release();
            return;
        }
        var sql1 = [
            "UPDATE user SET ",
            "status='live' ",
            "WHERE ",
            "uid=?; "
        ].join('');
        var param1 = [uid];
        sql1 = mysql.format(sql1,param1);
        var sql2 = [
            "UPDATE token SET ",
            "status='live' ",
            "WHERE ",
            "token=?;"
        ].join('');
        var param2 = [uid];
        sql2 = mysql.format(sql2,param2);
        conn.query(sql1+sql2, [1,2], function(err,result){
            conn.release();
            if(!err) {
                res.json('{status:live, uid:'+uid+'}');
            }
        });
        conn.on('error', function(err) {
            console.log(err);
            conn.release();
            return;
        });
    });
};

exports.deleteUser = function(res, uid){
    pool.getConnection(function(err,conn){
        if (err) {
            console.log(err);
            conn.release();
            return;
        }
        var sql1 = [
            "UPDATE user SET ",
            "status='deleted' ",
            "WHERE ",
            "uid=?; "
        ].join('');
        var param1 = [uid];
        sql1 = mysql.format(sql1,param1);

        var sql2 = [
            "UPDATE project SET ",
            "status='deleted' ",
            "WHERE ",
            "uid=?;"
        ].join('');
        var param2 = [uid];
        sql2 = mysql.format(sql2,param2);

        var sql3 = [
            "UPDATE token SET ",
            "status='deleted' ",
            "WHERE ",
            "token=?;"
        ].join('');
        var param3 = [uid];
        sql3 = mysql.format(sql3,param3);
        conn.query(sql1+sql2+sql3, [1,2,3], function(err,result){
            conn.release();
            if(!err) {
                res.json('{status:deleted, uid:'+uid+'}');
            }
        });
        conn.on('error', function(err) {
            console.log(err);
            conn.release();
            return;
        });
    });
};

exports.insertProject = function(res, projectName, packageName, version, uid ,GUID, bucketUsage, status, createDate){
    pool.getConnection(function(err,conn){
        if (err) {
            console.log(err);
            conn.release();
            return;
        }
        var sql1 = [
            "INSERT INTO project SET ",
            "projectName=?",
            ",packageName=?",
            ",version=?",
            ",uid=?",
            ",GUID=?",
            ",bucketUsage=?",
            ",status=?",
            ",createDate=?;"
        ].join('');
        var param1 = [projectName,packageName,version,uid,GUID,bucketUsage,"live",createDate];
        sql1 = mysql.format(sql1,param1);

        var sql2 = [
            "INSERT INTO apps SET ",
            "uid=?",
            ",GUID=?",
            ",role=?;"
        ].join('');
        var param2 = [uid,GUID,"d"];
        sql2 = mysql.format(sql2,param2);

        var sql3 = [
            "UPDATE user SET ",
            "GUID=? ",
            "WHERE ",
            "uid=?;"
        ].join('');
        var param3 = [GUID,uid];
        sql3 = mysql.format(sql3,param3);

        conn.query(sql1+sql2+sql3, [1,2],function(err,result){
            conn.release();
            if(!err) {
                res.json("{status:success, GUID:"+GUID+"}");
            }
        });
        conn.on('error', function(err) {
            console.log(err);
            conn.release();
            return;
        });
    });
};