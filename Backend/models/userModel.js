const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:[true,"Please Enter Your Name"],
        maxLength:[30,"Name cannot be exceded 30 character"],
        minLength:[4,"Name should be more than 4 character"],
    },
      email:{
        type:String,
        required:[true,"Please Enter Your Email"],
        unique:true,
        validate:[validator.isEmail,"Please Enter a valid Email"]
      },
      password:{
        type:String,
        required:[true,"Please Enter Your Password"],
        minLength:[8,"password should be grater than 8 character"],
      select:false,
      },
      avatar: {
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    role:{
        type:String,
        default:"user",
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date
})

userSchema.pre("save",async function(next){

  if(!this.isModified("password")){
    next();
  }

   this.password =await bcrypt.hash(this.password,10)
});

//JWT TOKEN
userSchema.methods.getJWTToken = function(){
  return jwt.sign({id:this._id},process.env.JWT_SECRET,{
    expiresIn:process.env.JWT_EXPIRE,
  })
};

//compare Password
userSchema.methods.comparePassword = async function(enterdPassword){
    return await bcrypt.compare(enterdPassword,this.password)
}

//Generating Password and reset Token
userSchema.methods.getResetPasswordToken = function(){

// Generating Token
const resetToken = crypto.randomBytes(20).toString("hex");

// Hashing and add to user schema
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  this.resetPasswordExpire = Date.now() + 15*60*1000;

  return resetToken;

}

module.exports = mongoose.model("User",userSchema);