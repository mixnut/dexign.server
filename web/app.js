var express = require('express');
var http = require('http');
var path = require('path');
var router = require('./router/main');
var app = express();
var redis = require('redis');
//fs = require("fs");

var client = redis.createClient('6379', 'redis');

// client.on("error", function (err) {
//     console.log("Error " + err);
// });
//
// client.set("string key", "string val", redis.print);
// client.hset("hash key", "hashtest 1", "some value", redis.print);
// client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
// client.hkeys("hash key", function (err, replies) {
//     console.log(replies.length + " replies:");
//     replies.forEach(function (reply, i) {
//         console.log("    " + i + ": " + reply);
//     });
//     client.quit();
// });

app.set('port',process.env.PORT || 8080);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', router);

module.exports = app;
var server = app.listen(app.get('port'), function(){
    console.log('Express server listening on port ' +server.address().port)
});


