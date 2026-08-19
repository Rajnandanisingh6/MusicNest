const userModel = require('../models/user.model'); //Import the user model to interact with the user collection in the database
const jwt = require('jsonwebtoken'); //Import the jsonwebtoken module to create and verify JWT tokens
const bcrypt = require('bcryptjs'); //Import the bcryptjs module to hash and compare passwords

async function registerUser(req,res){
    
    const{username,email,password,role='user'} = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })
    if(isUserAlreadyExists){
        res.status(409).json({message: "User Already exists"});
    }

    const hash = await bcrypt.hash(password,10); //Hash the password using bcrypt with a salt round of 10

    const user = await userModel.create({
        username,
        email,
        password:hash,
        role,
    })

    const token = jwt.sign({
        id: user._id,
        role: user.role
    },process.env.JWT_SECRET)

    res.cookie("token",token);

    res.status(201).json({
        message:"User Registered successfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email,
            role : user.role,
        }
    })
    

}

async function loginUser(req,res){
    const {username,email,password} = req.body;
    const user = await userModel.findOne({
        $or:[
          {username},
          {email}
        ]
   })
   if(!user){
    return res.status(401).json({message: "Invalid credentials"});
   }

   isPasswordValid = await bcrypt.compare(password,user.password);

   if(!isPasswordValid){
    return res.status(401).json({message :"Invalid credentials"});
   }

   const token = jwt.sign({
    id: user._id,
    role: user.role
    },process.env.JWT_SECRET)
   
    res.cookie("token",token);

    res.status(200).json({
        message:"User logged in successfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email,
            role : user.role,
        }
    })
}

async function logoutUser(req,res){
    res.clearCookie("token");
    res.status(200).json({message:"User logged out successfully"});
}
module.exports ={registerUser, loginUser, logoutUser};