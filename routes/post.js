var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var moment = require('moment');
var Post = require('../models/Post');

router.get('/', function(req,res){

    var limit = 5;
    var page = Math.max(1,req.query.page);

    Post.count({}).exec(function(err,count){
        var totalPost = count;
        var maxPage = Math.ceil(totalPost/limit);
        var skip = (page-1)*limit;
        Post.find({})
            .sort("-createdAt")
            .populate('author')
            .skip(skip)
            .limit(limit)
            .exec(function(err,posts){
                if(err) return res.json({success:false, message:err});
                res.render('index',{data:posts, user:req.user, moment:moment, maxPage: maxPage, page:page, count:count});
        });
    });

});


router.get('/view/:postId',isLoggedIn, function(req,res){
    Post.findById(req.params.postId)
        .populate(['author','comment.author'])
        .exec(function(err, post){
            Post.count({author:post.author._id}, function(err, count){
                if(err) return res.json({success:'false', message:err});
                if(!(req.user._id.equals(post.author._id))){
                    post.counter++;
                    console.log("Different User, update counter");
                }else{
                  console.log("Same user, no counter update");
                }
                post.save();
                res.render('view', {user:req.user,post:post, moment:moment, count:count});
            });
    });
});

router.get('/new', isLoggedIn, function(req,res){
    res.render('new', {user:req.user});
});

router.post('/new', isLoggedIn, function(req,res){
    req.body.new.author = req.user._id;
    Post.create(req.body.new, function(err, post){
       if(err) return res.json({success:'false', message:err});
        res.redirect('/');
    });
});

router.get('/edit/:postId',isLoggedIn, function(req, res){
  Post.findById(req.params.postId, function(err,post){
    if(err) return res.json({success:false, message:err});
    res.render('edit', {user:req.user, post:post});
  });
});

router.put('/edit/:postId', function(req,res){
  req.body.edit.updatedAt = Date.now();
  Post.findByIdAndUpdate({_id:req.params.postId}, req.body.edit, function(err,post){
    if(err) return res.json({success:false, message:err});

    post.updatedAt = Date.now;
    post.save();
    console.log(post.updatedAt);
    res.redirect('/post/view/' + req.params.postId);
  });
});

router.delete('/view/delete/:postId', isLoggedIn, function(req,res){
   Post.findByIdAndRemove(req.params.postId, function(err, post){
       if(err) return res.json({success:'false', message:err});
       res.redirect('/');
   });
});

router.post('/view/:postId/comment', isLoggedIn, function(req,res){
    var newComment = req.body.comment;
    newComment.author = req.user._id;
    Post.update({_id:req.params.postId},{$push:{comment: newComment}}, function(err, post){
        if (err) return res.json({success:'false', message:err});
        res.redirect('/post/view/' + req.params.postId);
    });

});

router.delete('/view/:postId/delete/comment/:commentId', isLoggedIn, function(req,res){
    Post.update({_id:req.params.postId},{$pull:{comment:{_id:req.params.commentId}}}, function(err, post){
        if (err) return res.json({success:'false', message:err});
        res.redirect('/post/view/' + req.params.postId);
    });

});



function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

module.exports = router;
