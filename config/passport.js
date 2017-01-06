var mongoose          = require('mongoose');
var passport          = require('passport');
var LocalStrategy     = require('passport-local').Strategy;
var GoogleStrategy    = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy  = require('passport-facebook').Strategy;
var GithubStrategy   = require('passport-github2').Strategy;
var User              = require('../models/User');
var bcrypt            = require('bcrypt-nodejs');
var auth              = require('../config/auth');


passport.serializeUser(function(user,done){
  done(null,user.id);
});

passport.deserializeUser(function(id,done){
  User.findById(id, function(err,user){
    done(err,user);
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////                           LOCAL LOGIN         ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

passport.use('local-login', new LocalStrategy({
  usernameField:'email',
  passwordField:'password',
  passReqToCallback: true,
  },
  function(req,email,password,done){
    User.findOne({'local.email':email}, function(err,user){
      if(err) return done(err);

      if(!user){
         req.flash('email', req.body.email);
        return done(null, false, req.flash('loginError', 'No user found <br><a href="/user/signup">Click here to Sign up!</a>'));
      }

       if(!user.validPassword(password)){
         req.flash('username', req.body.username);
         return done(null, false, req.flash('loginError', 'Password does not match'));
       }
      return done(null, user);
    });
  }
));


////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////                           LOCAL SIGN - UP         ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
  },
  function(req, email, password, done){
    process.nextTick(function(){
      User.findOne({'local.email': email}, function(err, user){
        if(err) return done(err);
        if(user){
          return done(null, false, req.flash("emailError","This email is already taken"));
        }else{
          User.findOne({'local.nickname': req.body.nickname}, function(err, nickname){
            if(err) return done(err);
            if(nickname){
              return done(null, false, req.flash("nicknameError","This nickname is already taken"));
            }else{
              var newUser = new User();
              newUser.local.email = email;
              newUser.local.password = newUser.generateHash(password);
              newUser.local.nickname = req.body.nickname;
              newUser.save(function(err){
                if(err) return console.log(err);
                return done(null, newUser);
              });
            }
          });
        }
      });
    })}
));

////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////                           GOOGLE LOGIN         ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////


passport.use('google', new GoogleStrategy({
    clientID          : auth.googleAuth.clientID,
    clientSecret      : auth.googleAuth.clientSecret,
    callbackURL       : auth.googleAuth.callbackURL,
    passReqToCallback : true
  },
  function(req, token, refreshToken, profile, done){
    process.nextTick(function(){
      // if(!req.user){
        User.findOne({'google.id': profile.id}, function(err, user){
          if(err) done(err);
          if(user){
            return done(null, user);
          }else{
            var newUser = new User();
            newUser.google.id     = profile.id;
            newUser.google.token  = token;
            newUser.google.email  = profile.emails[0].value;
            newUser.google.name   = profile.displayName;

            newUser.save(function(err){
              if(err) throw err;
              return done(null, newUser);
            });
          }
        });
    //   }else{
    //         console.log("This works 1");
    //     var user           = req.user;
    //     user.google.id     = profile.id;
    //     user.google.token  = token;
    //     user.google.email  = profile.emails[0].value;
    //     user.google.name   = profile.displayName;
    //         console.log("This works 2");
    //     user.save(function(err){
    //       if(err) throw err;
    //           console.log("This works 3");
    //       return done(null, user);
    //     });
    // };
  });
}));


////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////                           GITHUB   LOGIN         /////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

passport.use('github', new GithubStrategy({
    clientID       : auth.githubAuth.clientID,
    clientSecret    : auth.githubAuth.clientSecret,
    callbackURL       : auth.githubAuth.callbackURL,
    passReqToCallback : true
  },
  function(req, accessToken, refreshToken, profile, done){
    process.nextTick(function(){
      console.log("error");
      // if(!req.user){
        User.findOne({'github.id': profile.id}, function(err, user){
          if(err) {
            console.log("error here! 1");
            done(err);
          }
          if(user){
            console.log("error here! 2");
            return done(null, user);
          }else{
            console.log("error here! 3");
            console.log(profile);
            var newUser               = new User();
            newUser.github.id        = profile.id;
            newUser.github.token     = accessToken;
            newUser.github.email     = profile.emails[0].value;
            newUser.github.name      = profile.displayName;
                console.log("error here! 4");

            newUser.save(function(err){
              if(err) {
                console.log("error here! 7" + " err: " + err);
                throw err;}
              return done(null, newUser);
            });
          }
        });
  });
}));


////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////                           FaceBook LOGIN         /////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

passport.use('facebook', new FacebookStrategy({
    clientID          : auth.facebookAuth.clientID,
    clientSecret      : auth.facebookAuth.clientSecret,
    callbackURL       : auth.facebookAuth.callbackURL,
    profileFields     : ['id','name','emails'],
    passReqToCallback : true
  },
  function(req, token, refreshToken, profile, done){
    process.nextTick(function(){
      console.log(profile);
      // if(!req.user){
        User.findOne({'facebook.id': profile.id}, function(err, user){
          if(err) {
            console.log("error here! 1");
            done(err);
          }
          if(user){
            console.log("error here! 2");
            return done(null, user);
          }else{
            console.log("error here! 3");
            var newUser             = new User();
            newUser.facebook.id     = profile.id;
            newUser.facebook.token  = token;
            newUser.facebook.email  = profile.emails[0].value;
            newUser.facebook.name   = profile.name.givenName + " " + profile.name.familyName;
                console.log("error here! 4");

            newUser.save(function(err){
              if(err) {
                console.log("error here! 7" + " err: " + err);
                throw err;}
              return done(null, newUser);
            });
          }
        });
  });
}));



module.exports = passport;
