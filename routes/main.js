var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var moment = require('moment');
var passport = require('../config/passport');


router.get('/', function(req,res){
  res.redirect('/post');
});

router.get('/login', function(req,res){
  res.render('login',{message:req.flash("loginError"), user:req.user});
});

router.post('/login', passport.authenticate('local-login',{
  successRedirect:'/',
  failureRedirect:'/login',
  failureFlash:true,
  })
);

router.get('/logout', function(req,res){
    req.logout();
    res.redirect('/');
});

router.get('/auth/google', passport.authenticate('google',{scope:['profile', 'email']}));

router.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/'}),
  function(req, res){
    var currentUser = req.user._id;
    console.log("reload complete");
    res.redirect('/');
  }
);

router.get('/auth/facebook', passport.authenticate('facebook',{scope: ['email']}));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  failureRedirect: '/'}),
  function(req, res){
    var currentUser = req.user._id;
    console.log("reload complete");
    res.redirect('/');
  }
);

router.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

router.get('/auth/github/callback', passport.authenticate('github', {
  failureRedirect: '/'}),
  function(req, res){
    var currentUser = req.user._id;
    console.log("reload complete");
    res.redirect('/');
  }
);

module.exports = router;
