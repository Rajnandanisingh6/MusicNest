const userModel = require('../models/user.model'); //Import the user model to interact with the user collection in the database
const jwt = require('jsonwebtoken'); //Import the jsonwebtoken module to create and verify JWT tokens
const bcrypt = require('bcryptjs'); //Import the bcryptjs module to hash and compare passwords

// Cookie options reused across login/register
const cookieOptions = {
    httpOnly: true,                                   // JS se cookie access nahi ho sakti (XSS se bachav)
    secure: process.env.NODE_ENV === 'production',     // production mein sirf HTTPS pe bheji jaayegi
    // frontend aur backend alag-alag domains pe hain (Render pe do alag services),
    // isliye cross-domain cookie bhejne ke liye 'none' chahiye. 'strict'/'lax' local
    // dev ke liye theek hai jahan dono same localhost pe hote hain.
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000                    // 7 din
};

// Password strong hai ya nahi check karta hai. Return karta hai kya missing hai (empty array = sab theek).
function getPasswordIssues(password){
    const issues = [];
    if(password.length < 8) issues.push("at least 8 characters");
    if(!/[A-Z]/.test(password)) issues.push("one uppercase letter");
    if(!/[a-z]/.test(password)) issues.push("one lowercase letter");
    if(!/[0-9]/.test(password)) issues.push("one number");
    if(!/[^A-Za-z0-9]/.test(password)) issues.push("one special character");
    return issues;
}

async function registerUser(req,res){

    const{username,email,password,role} = req.body;

    if(!username || !email || !password){
        return res.status(400).json({message: "username, email and password are required"});
    }

    // sirf ye do values allowed hain — koi aur string (jaise "admin") reject ho jayega
    const ALLOWED_ROLES = ['user','artist'];
    const finalRole = role && ALLOWED_ROLES.includes(role) ? role : 'user';

    const passwordIssues = getPasswordIssues(password);
    if(passwordIssues.length > 0){
        return res.status(400).json({
            message: "Weak password",
            requirements: `Password must contain ${passwordIssues.join(", ")}`
        });
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })
    if(isUserAlreadyExists){
       return res.status(409).json({message: "User Already exists"});
    }

    const hash = await bcrypt.hash(password,10); //Hash the password using bcrypt with a salt round of 10

    const user = await userModel.create({
        username,
        email,
        password:hash,
        role: finalRole, // sirf whitelisted value — 'user' ya 'artist'
    })

    const token = jwt.sign({
        id: user._id,
        role: user.role
    },process.env.JWT_SECRET, { expiresIn: '7d' }) // token ab 7 din mein expire hoga

    res.cookie("token",token,cookieOptions);

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

    if(!password || (!username && !email)){
        return res.status(400).json({message: "username/email and password are required"});
    }

    const user = await userModel.findOne({
        $or:[
          {username},
          {email}
        ]
   })
   if(!user){
    return res.status(401).json({message: "Invalid credentials"});
   }

   const isPasswordValid = await bcrypt.compare(password,user.password);

   if(!isPasswordValid){
    return res.status(401).json({message :"Invalid credentials"});
   }

   const token = jwt.sign({
    id: user._id,
    role: user.role
    },process.env.JWT_SECRET, { expiresIn: '7d' })

    res.cookie("token",token,cookieOptions);

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