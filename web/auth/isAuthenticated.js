const isAuthenticated = function isAuthenticated(req, res, next) {

    // do any checks you want to in here

    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    // you can do this however you want with whatever variables you set up
    if (req.user.authenticated)
        return next();

    // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
    res.redirect('/');
}
// 사용 예시

/*module.exports = function(app) {

    app.get('/hello', isAuthenticated, function(req, res) {
        res.send('look at me!');
    });

};*/

module.exports = {
    isAuthenticated
};
