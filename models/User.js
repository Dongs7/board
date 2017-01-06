var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
  local:{
    email     :{type:String},
    nickname  :{type:String},
    password  :{type:String},
    createdAt :{type:Date, default:Date.now},
  },
  google:{
    id      : String,
    email   : String,
    name    : String,
    token   : String,
  },
  facebook:{
    id      : String,
    token   : String,
    email   : String,
    name    : String,
  },
  github:{
    id      : String,
    token   : String,
    name    : String,
    email   : String,
  }
});

userSchema.methods.generateHash  = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10),null);
};

userSchema.methods.validPassword = function(password){
  var user = this;
    return bcrypt.compareSync(password, this.local.password);
};
var User = mongoose.model('users', userSchema);

module.exports = User;
