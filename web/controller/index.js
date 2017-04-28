/**
 * Created by daemin Hwang on 2017-01-10.
 */

var pool = require("../lib/db_pool");
var mysql = require("mysql");

exports.search = function(req,res){
    pool.getConnection(function(err,conn){
        if (err) {
            conn.release();
            return;
        }
        conn.query("select * from test",function(err,rows){
            conn.release();
            if(!err) {
                res.json(rows);
            }
        });
        conn.on('error', function(err) {
            conn.release();
            return;
        });
    });
};

exports.insertUser = function(res, name,email,uid,GUID,role, createDate){
    pool.getConnection(function(err,conn){
        if (err) {
            console.log(err);
            conn.release();
            return;
        }
        var sql = [
            "INSERT INTO user SET ",
            "name=?",
            ",email=?",
            ",uid=?",
            ",GUID=?",
            ",role=?",
            ",status=?",
            ",createDate=?"
            ].join('');
        var param = [name,email,uid,GUID,role,"ready",createDate];
        sql = mysql.format(sql,param);
        console.log(sql);
        conn.query(sql,function(err,result){
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