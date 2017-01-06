var express     = require('express');
var router      = express.Router();
var passport    = require('../config/passport');
var mongoose    = require('mongoose');
var flash       = require('connect-flash');
var User        = require('../models/User');
var Post        = require('../models/Post');
var moment      = require('moment');
var async       = require('async');

var ObjectId = require('mongoose').Types.ObjectId;

router.get('/signup', function(req,res){
   res.render('signup', {emailError:req.flash('emailError')[0], nicknameError:req.flash('nicknameError')[0], user:req.user});
});

router.post('/signup', passport.authenticate('local-signup',{
  successRedirect:'/',
  failureRedirect:'/user/signup',
  failureFlash:true,
}));

router.get('/profile/:userId', isLoggedIn, function(req,res){
    var current = req.user._id;
    Post.count({author:current}, function(err,count){
       if(err) return res.json({success:false, message:err});

         res.render('profile', {user:req.user, count:count, moment:moment, messages:req.flash('error')[0]});
    });
});

router.get('/post/profile/:authorId',isLoggedIn, function(req,res){
  var selected = req.params.authorId;
  Post.aggregate(
      [
        { $match : { 'author' : { '$eq': new ObjectId(selected)}} },
        { $lookup:
          {
            from:"users",
            localField:'author',
            foreignField:'_id',
            as:'user_info'
          }
        },
        { $group:{_id:"$user_info", numPost:{$sum: 1}} }
      ]
    ,
    function(err,result){
      if(err) return res.json({success:false, message:err});
      if(result.length == 0){
        console.log("empty!");
        res.render('noPostError', {user:req.user});
      }else{
        var method = [];
        if (result[0]._id[0].google){
          method = result[0]._id[0].google.name;
        }else if(result[0]._id[0].facebook){
          method = result[0]._id[0].facebook.name;
        }else if(result[0]._id[0].github){
          method = result[0]._id[0].github.name;
        }else{
          method = result[0]._id[0].local.nickname;
        }
        res.render('userProfile', {user:req.user, nickname: method,  result:result[0]});
      }

  });
});

// router.get('/post/profile/:authorId',isLoggedIn, function(req,res){
//   var selected = req.params.authorId;
//   Post.findOne({'author': new ObjectId(selected)}).count().exec(function(err,result){
//     if(err) return res.json({success:false, message:err});
//     console.log(result.author);
//     res.render('userProfile', {user:req.user, numPost:result, nickname: result.author});
//   });
// });

// 포스트 요거 하기!



router.put('/profile/change_password/:userId', function(req, res){
  var currentPW = req.body.password.current;
  var newPW = req.body.password.new;
  var confirmPW = req.body.password.confirm;

  User.findById(req.params.userId, function(err,user){
    if(err) return ({success:'false', message:err});

    if(!user.validPassword(currentPW))
    {
      req.flash("error", "<span style='color:red'><b>Current Password is not matched with our database<b><span>");
      // res.locals.messages = req.flash();
      return res.redirect('/user/profile/' + req.params.userId);
    }
    else{
      if(newPW == confirmPW){
        user.local.password = user.generateHash(confirmPW);
        user.save();
      }
      else{
        req.flash('error', "<span style='color:red'><b>New Password and Confirm Password fields should be matched<b><span>");
        // res.locals.messages = req.flash();
        console.log("Please check your password");
      }
      req.flash('error', "<span style='color:green'><b>Password successfully changed!<b></span>");
      return res.redirect('/user/profile/' + req.params.userId);
    }
  });
});






function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

function checkUserValidation (req,res,next){
   var isValid = true;

    async.waterfall([function(callback){
        User.findOne({'local.email':req.body.email, _id:{$ne: mongoose.Types.ObjectId(req.params.id)}},
            function(err,user){
            if(user){
                isValid = false;
                req.flash('emailError', "This email is already taken");
            }
            callback(null, isValid);
        }
    );
    }, function(isValid, callback){
        User.findOne({'local.nickname':req.body.nickname, _id:{$ne: mongoose.Types.ObjectId(req.params.id)}},
            function(err,user){
                if(user){
                    isValid = false;
                    req.flash('nicknameError', "This nickname is already taken");
                }
            callback(null, isValid);
        }
    );
    }], function(err, isValid){
        if(err) return res.json({success:'false', message:err});
        if(isValid){
            return next();
        }else{
            req.flash("formData", req.body);
            res.redirect("back");
        }
    }
    );
}


module.exports = router;
