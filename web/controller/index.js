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
            conn.release();
            return;
        });
    });
};

exports.getUserName = function(uid, callback){
    pool.getConnection(function(err,conn){
        if (err) {
            conn.release();
            return;
        }
        var sql = "SELECT name FROM user WHERE uid=?"
        var param = [uid];
        sql = mysql.format(sql,param);
        conn.query(sql,function(err,results){
            conn.release();
            if(err) {
                callback(err,null);
            }else{
                if(results.length > 0){
                    callback(null,results[0].name);
                }else{
                    callback(null,null);
                }

            }
        });
        conn.on('error', function(err) {
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
        var param1 = [name,email,uid,GUID,role,"pending",createDate];
        sql1 = mysql.format(sql1,param1);

        var sql2 = [
            "INSERT INTO token SET ",
            "token=?",
            ",status=?",
            ",createDate=?;"
        ].join('');
        var param2 = [uid,"pending",createDate];
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
                res.json({status:"success", data:{status:"pending"}});
            }
        });
        conn.on('error', function(err) {
            console.log(err);
            conn.release();
            return;
        });
    });
};

exports.updateUser = function(res, _uid, _userName){
    pool.getConnection(function(err,conn){
        if (err) {
            console.log(err);
            conn.release();
            return;
        }
        var sql1 = [
            "UPDATE user SET ",
            "status='success' ",
            "WHERE ",
            "uid=?; "
        ].join('');
        var param1 = [_uid];
        sql1 = mysql.format(sql1,param1);
        var sql2 = [
            "UPDATE token SET ",
            "status='success' ",
            "WHERE ",
            "token=?;"
        ].join('');
        var param2 = [_uid];
        sql2 = mysql.format(sql2,param2);
        conn.query(sql1+sql2, [1,2], function(err,result){
            conn.release();
            if(!err) {
                res.json({status:"success", data:{status:"success", uid:_uid, username:_userName}});
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
                res.json({status:"success"});
            }
        });
        conn.on('error', function(err) {
            console.log(err);
            conn.release();
            return;
        });
    });
};

exports.insertProject = function(res, projectName, packageName, version, uid ,_GUID, bucketUsage, status, createDate){
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
        var param1 = [projectName,packageName,version,uid,_GUID,bucketUsage,"success",createDate];
        sql1 = mysql.format(sql1,param1);

        var sql2 = [
            "INSERT INTO apps SET ",
            "uid=?",
            ",GUID=?",
            ",role=?;"
        ].join('');
        var param2 = [uid,_GUID,"d"];
        sql2 = mysql.format(sql2,param2);

        var sql3 = [
            "UPDATE user SET ",
            "GUID=? ",
            "WHERE ",
            "uid=?;"
        ].join('');
        var param3 = [_GUID,uid];
        sql3 = mysql.format(sql3,param3);

        conn.query(sql1+sql2+sql3, [1,2],function(err,result){
            conn.release();
            if(!err) {
                res.json({status:"success", data:{GUID:_GUID}});
            }
        });
        conn.on('error', function(err) {
            console.log(err);
            conn.release();
            return;
        });
    });
};

exports.listLambdas = function(res){

    pool.getConnection(function(err,connection){
        if (err) {
            connection.release();
            return;
        }
        connection.query("select * from lambda",function(err,rows){
            connection.release();
            if(!err) {
                var array=[];
                for(x in rows){
                    array.push({seq:rows[x].seq, email:rows[x].email, name:rows[x].name, code:rows[x].code, parameters:rows[x].parameters, createDate:rows[x].createDate});
                }
                res.json({status:"success", data:array});
            }else{
                res.json({status:"failed"});
            }
        });
        connection.on('error', function(err) {
            connection.release();
            return;
        });
    });
};

exports.insertLambda = function(res, email, name, code, parameters, createDate){
    pool.getConnection(function(err,conn){
        if (err) {
            console.log(err);
            conn.release();
            return;
        }
        var sql = [
            "INSERT INTO lambda SET ",
            "email=?",
            ",name=?",
            ",code=?",
            ",parameters=?",
            ",createDate=? ",
            "ON DUPLICATE KEY UPDATE ",
            "email=?",
            ",name=?",
            ",code=?",
            ",parameters=?",
            ",createDate=?;"
        ].join('');
        var param = [email,name,code,parameters,createDate,email,name,code,parameters,createDate];
        sql = mysql.format(sql,param);

        conn.query(sql ,function(err,result){
            conn.release();
            if(!err) {
                res.json({status:"success"});
            }else{
                res.json({status:"faild", message:err.message});
            }
        });
        conn.on('error', function(err) {
            conn.release();
            res.json({status:"faild", message:err.message});
            return;
        });
    });
};
exports.updateLambda = function(res, email, name, code, parameters){
    pool.getConnection(function(err,conn){
        if (err) {
            console.log(err);
            conn.release();
            return;
        }
        var sql = [
            "UPDATE lambda SET ",
            "code=?, ",
            "parameters=? ",
            "WHERE ",
            "email=? ",
            "AND ",
            "name=?;"
        ].join('');
        var param = [code,parameters,email,name];
        sql = mysql.format(sql,param);
        conn.query(sql, function(err,result){
            conn.release();
            if(!err) {
                res.json({status:"success"});
            }
        });
        conn.on('error', function(err) {
            console.log(err);
            conn.release();
            return;
        });
    });
};

exports.deleteLambda = function(res, email, name){
    pool.getConnection(function(err,conn){
        if (err) {
            console.log(err);
            conn.release();
            return;
        }
        var sql = [
            "DELETE FROM lambda ",
            "WHERE ",
            "email=? ",
            "AND ",
            "name=?;"
        ].join('');
        var param = [email,name];
        sql = mysql.format(sql,param);

        conn.query(sql, function(err,result){
            conn.release();
            if(!err) {
                res.json({status:"success"});
            }
        });
        conn.on('error', function(err) {
            console.log(err);
            conn.release();
            return;
        });
    });
};

exports.readLambda = function(email, name, callback){
    pool.getConnection(function(err,conn){
        if (err) {
            conn.release();
            return;
        }
        var sql = [
            "SELECT code,name,parameters FROM lambda ",
            "WHERE ",
            "email=? ",
            "AND ",
            "name=?;"
        ].join('');
        var param = [email,name];
        sql = mysql.format(sql,param);

        conn.query(sql,function(err,results){
            conn.release();
            if(err) {
                callback(err,null);
            }else{
                if(results.length > 0){
                    callback(null,results);
                }else{
                    callback(null,null);
                }

            }
        });
        conn.on('error', function(err) {
            conn.release();
            return;
        });
    });
};

exports.deleteAll = function(res){
    pool.getConnection(function(err,conn){
        if (err) {
            console.log(err);
            conn.release();
            return;
        }
        var sql1 = "DELETE FROM apps;";
        var sql2 = "DELETE FROM project;";
        var sql3 = "DELETE FROM token;";
        var sql4 = "DELETE FROM user;";

        conn.query(sql1+sql2+sql3+sql4, [1,2,3,4],function(err,result){
            conn.release();
            if(!err) {
                res.json({status:"success", data:{status:"delete all"}});
            }
        });
        conn.on('error', function(err) {
            console.log(err);
            conn.release();
            return;
        });
    });
};