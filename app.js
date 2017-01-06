var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var passport = require('passport');
var passport = require('./config/passport');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require('express-session');
var methodOverride = require('method-override');
var router = express.Router();
var app = express();

//db connection
var dbconnection = require('./config/dbconnect');
var db = mongoose.connection;

db.once('open',function(err){
  console.log("connected!");
});

db.on('error',function(err){
  console.log("DB connection failed", err);
});
//------------connection done


app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(flash());

app.use(session({ secret: 'shhsecret',
                  resave:true,
                  saveUninitialized: true,
                }));


app.use(passport.initialize());
app.use(passport.session());

app.use('/', require('./routes/main'));
app.use('/post', require('./routes/post'));
app.use('/user', require('./routes/user'));

var port = process.env.PORT || 3000;
app.listen(port,function(){
   console.log("App is listeing on port 3000...");
});
