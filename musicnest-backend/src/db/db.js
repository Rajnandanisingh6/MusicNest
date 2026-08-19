const mongoose = require('mongoose');



async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Database connected to successfully");


    }catch(error){
        console.error('Error connecting to database:',error);
        
    }
    
}

module.exports = connectDB;