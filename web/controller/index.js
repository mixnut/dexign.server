/**
 * Created by daemin Hwang on 2017-01-10.
 */

var pool = require("../lib/db_pool");

exports.search = function(req,res){

    pool.getConnection(function(err,connection){
        if (err) {
            connection.release();
            return;
        }
        connection.query("select * from test",function(err,rows){
            connection.release();
            if(!err) {
                res.json(rows);
            }
        });
        connection.on('error', function(err) {
            connection.release();
            return;
        });
    });
};