var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
  title:{type:String, required:true},
  body:{type:String, required:true},
  author:{type:mongoose.Schema.Types.ObjectId, ref:'users', required: true},
  comment:[{
      author:{type: mongoose.Schema.Types.ObjectId, ref:'users'},
      createdAt:{type:Date, default:Date.now},
      body:{type:String}
  }],
  counter:{type:Number, default:0},    
  createdAt:{type:Date, default:Date.now},
  updatedAt:Date,
});

var Post = mongoose.model('posts', postSchema);

module.exports = Post;
