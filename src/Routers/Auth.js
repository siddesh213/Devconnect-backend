const express=require("express")
const authRouter=express.Router()
const {UserModel}=require("../models/user")
const {ValidateSignupData}=require("../utils/validation")
const bcrypt=require("bcrypt")
// Save User Data Into Your DataBase
authRouter.post("/signup", async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const { FirstName, LastName, EmailId, PassWord } = req.body;

    // ✅ Required fields validation
    if (!FirstName || !LastName || !EmailId || !PassWord) {
      return res.status(400).send("All required fields must be filled");
    }

    // ✅ Check duplicate email
    const existingUser = await UserModel.findOne({ EmailId });
    if (existingUser) {
      return res.status(400).send("Email already registered");
    }

    // ✅ Password hashing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(PassWord, saltRounds);

    // ✅ Create user (PhotoUrl optional for now)
    const user = await UserModel.create({
      FirstName,
      LastName,
      EmailId,
      PassWord: hashedPassword,
      PhotoUrl: "",
    });

    console.log("User saved:", user._id);

    // ✅ Consistent response format for frontend
    return res.status(201).json({ 
      message: "Signup Successful",
      user: user 
    });

  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).send("Signup failed. Server error occurred.");
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { EmailId, PassWord } = req.body;

    // ✅ Find user by email
    const Find_Email = await UserModel.findOne({ EmailId: EmailId });
    if (!Find_Email) {
      return res.status(404).send("Invalid credentials");
    }

    // ✅ Check password
    const isPasswordValid = await Find_Email.VerifyPassword(PassWord);
    if (!isPasswordValid) {
      return res.status(404).send("Invalid credentials");
    }

    // ✅ Generate JWT token
    const token = await Find_Email.getJWT();

    // ✅ Set cookie
    res.cookie("token", token, { httpOnly: true });

    // ✅ Success response
    res.status(200).send(Find_Email);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error: " + err.message);
  }
});

authRouter.post("/logout",async(req,res)=>{
    res.cookie("token",null ,{expires:new Date (Date.now())})
     res.send("logout succesfully")
})


module.exports={authRouter}

//~