const musicModel = require('../models/music.model');
const albumModel = require('../models/album.model');
const { uploadFile } = require('../services/storage.service');
const jwt = require('jsonwebtoken');

async function createMusic(req, res) {
    
        const { title } = req.body;
        const file = req.file;

        const result = await uploadFile(file.buffer.toString('base64'));

        const music = await musicModel.create({
            uri: result.url,
            title,
            artist: req.user.id,
        });

            res.status(201).json({
            message: "Music created successfully",
            music: {
                id: music._id,
                uri: music.uri,
                title: music.title,
                artist: music.artist,
            },
        });
} 


async function createAlbum(req,res){
    
       const {title,musics} = req.body;

        const album = await albumModel.create({
            title,
            artist:req.user.id,
            musics:musics,
        })
            res.status(201).json({
            message:"Album created successfully",
            album:{
                id: album._id,
                title: album.title,
                artist: album.artist,
                musics: album.musics,
            }
        });


}
  
const getAllMusics = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 20, 50);

        const skip = (page - 1) * limit;

        const musics = await musicModel
            .find()
            .skip(skip)
            .limit(limit)
            .populate("artist", "username email");

        const total = await musicModel.countDocuments();

        return res.status(200).json({
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            musics
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch music",
            error: error.message
        });
    }
};

async function getAllAlbums(req,res){
    const albums = await albumModel.find().select("title artist ").populate('artist','username email');
    res.status(200).json({
        message:"Albums fetched successfully",
        albums : albums
    })
}

async function getAlbumById(req,res){
    const album = await albumModel.findById(req.params.albumId).populate('artist','username email').populate('musics');
    res.status(200).json({
        message:"Album fetched successfully",
        album : album
    })
}


module.exports = { createMusic, createAlbum, getAllMusics, getAllAlbums, getAlbumById };