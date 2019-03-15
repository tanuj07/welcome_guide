var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

var config = {
    user:'abhishek1036cse16',
    database:'abhishek1036cse16',
    host:'db.imad.hasura-app.io',
    port:'5432',
    password: process.env.DB_PASSWORD
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret: 'someRandomSecretValue',
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}
}));




function checkLogin(req){
    if (req.session && req.session.auth && req.session.auth.userId) {
       pool.query('SELECT * FROM "user" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err) {
               return 500;
           } else {
               return result.rows[0].username;
           }
       });
   } else {
       return 400; 
   }
}

app.get('/', function (req, res) {
  result =  checkLogin(req);
  if(result == 400 || result == 500){
      res.sendFile(path.join(__dirname, 'ui', 'index.html'));
  }
  else {
      res.sendFile(path.join(__dirname, 'ui', 'main.html'));
  }
});

function hash (input, salt) {
    // how to create a hash
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');
}
app.get('/hash/:input', function (req, res) {
    var hashedString = hash(req.params.input, 'this-is-some-random-string');
    res.send(hashedString);
});

app.post('/create-user', function (req, res) {
   //username, password
   //JSON
   var username = req.body.username;
   var password = req.body.password;
   var salt = crypto.randomBytes(128).toString('hex');
   var dbString = hash (password, salt);
   pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)', [username, dbString], function (err, result) {
       if (err){
            res.status(500).send(err.toString());
        } else {
            res.send('User successfully created: ' + username);
        }
   });
});

app.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    pool.query('SELECT * FROM "user" WHERE username = $1', [username], function (err, result) {
    if (err) {
            res.status(500).send(err.toString());
        } else {
            if (result.rows.length === 0) {
                res.status(403).send('username/password incorrect..');
            } else {
                //match the passeord
                var dbString = result.rows[0].password;
                var salt = dbString.split('$')[2];
                var hashedPassword = hash (password, salt); //creating a hash based on password submitted and original salt
                if (hashedPassword === dbString) {
                    
                    // set the session
                    
                    req.session.auth = {userId: result.rows[0].id};
                    //set a cookie with a session id
                    //internally, on the server side, it maps the cookie with an object auth
                    //{auth: {userId}}
                    res.redirect('back');
                } else {
                    res.status(403).send('username/password is invalid...');
                }
            }
        }
   });
});

app.get('/check-login', function (req, res) {
   result = checkLogin(req);
   if(result == 500){
       res.status(500).send(err.toString());
   }
   else if(result == 400){
       res.status(400).send('You are not logged in');
   }
   else{
       res.send(result);
   }
});

app.get('/logout', function (req, res) {
    delete req.session.auth;
    res.send('<html><body>Logged out!<br/><br/><a href="/">Back to home</a></body></html>');
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

var pool = new Pool(config);
app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/:filename', function (req, res) {
    res.sendFile(path.join(__dirname, 'ui', req.params.fileName));
});
// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}`);
});

