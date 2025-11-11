const mongoose = require("mongoose");
const validator = require("validator");
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
// Allowed genders
const allowedGenders = ["male", "female", "binary"];

const UserSchema = new mongoose.Schema({
  FirstName: {
    type: String,
    required: true,
    minlength: 2,   // more practical than 5
    maxlength: 30,
    trim: true
  },

  LastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,  // allow longer last names
    trim: true
  },

  EmailId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: "Enter a valid email"
    }
  },

  PassWord: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (value) => validator.isStrongPassword(value),
      message: "Password must be strong (min 8 chars, mix of uppercase, lowercase, number, symbol)"
    }
  },

  Gender: {
    type: String,
    lowercase: true,
    enum:{
      values:["male","female","other"],
      message:`{VALUE} is not valid gender`
    }
  
  },

  Age: {
    type: Number,
    min: [18, "User must be at least 18 years old"],
    max: [90, "Please enter a realistic age"],
    validate: {
      validator: Number.isInteger,
      message: "Age must be an integer"
    }
  },
PhotoUrl: {
  type: String,
  default: "",
  validate: {
    validator: (value) => {
      return (
        !value || // ✅ allow empty string (before upload)
        value.startsWith("http://") || // ✅ allow full URL
        value.startsWith("https://") || // ✅ allow HTTPS
        value.startsWith("/uploads/") || // ✅ allow local file path
        value.startsWith("data:image/") // ✅ allow base64 images
      );
    },
    message: "Enter a valid PhotoUrl",
  },
},





  About: {
    type: String,
    trim: true,
    default: "This Is The Info Of My Profile"
  },

  Skills: {
    type: [String],
    default: [],
    validate:{
      validator:function(arr){
        return arr.length<=10
      },
      message:"You can only add up to 10 skills."
       
      
    }
  }
}, {
  timestamps: true
});

// Create User model
UserSchema.methods.getJWT = async function () {
  const user = this;
  const payload = { User_Id: user._id };
  const SecretKey = "DevConnector@2004";

  const token = jwt.sign(payload, SecretKey, { expiresIn: "1d" });
  return token;
};

UserSchema.methods.VerifyPassword = async function (PassWord) {
  // `this` refers to the user document
  const user = this;
  const isMatch = await bcrypt.compare(PassWord, user.PassWord);
  return isMatch;
};

const UserModel = mongoose.model("User", UserSchema);


module.exports = { UserModel };
