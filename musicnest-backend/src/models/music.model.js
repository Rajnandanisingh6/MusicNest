const mongoose = require('mongoose');


const musicSchema = new mongoose.Schema({
    uri:{
        type:String,
        required : true,
    },
    fileId:{
        type:String,
    },
    title:{
        type :String,
        required : true,
    },
    artist:{
        type :mongoose.Schema.Types.ObjectId,
        ref :"user",
        required : true,
    },
    coverImage:{
        url:{ type: String },
        fileId:{ type: String },
    },
    likes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    playCount:{
        type: Number,
        default: 0
    }
})


const musicModel = mongoose.model('music',musicSchema);

module.exports = musicModel;