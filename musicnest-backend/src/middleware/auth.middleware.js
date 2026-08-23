const jwt = require('jsonwebtoken');


async function authArtist(req,res,next){
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({message:"unauthorized"});
    }

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        if(decoded.role !=="artist"){
            return res.status(403).json({message:"You don't have access"})
        }
        req.user = decoded;
        next();
    }
    catch(err){
        console.log(err);
        return res.status(401).json({message:"unauthorized"});
    }
}

async function authUser(req,res,next){
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({message:"unauthorized"});     
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        // pehle sirf role==="user" allow tha, jisse artist khud music/albums bhi nahi
        // dekh paata tha. Ab koi bhi valid logged-in user (user ya artist) allowed hai —
        // role-specific restriction sirf authArtist mein honi chahiye.
        req.user = decoded;
        next();

    }
    catch(err){
        console.log(err);
        return res.status(401).json({message:"unauthorized"});
    }
}
module.exports ={authArtist, authUser};