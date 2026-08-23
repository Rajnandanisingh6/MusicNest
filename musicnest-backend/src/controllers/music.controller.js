const musicModel = require('../models/music.model');
const albumModel = require('../models/album.model');
const { uploadFile } = require('../services/storage.service');

async function createMusic(req, res) {
    try {
        const { title } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "music file is required" });
        }
        if (!title) {
            return res.status(400).json({ message: "title is required" });
        }

        // ek artist max 50 songs hi upload kar sake, isse koi ek account akela poora
        // ImageKit free quota khatam nahi kar dega
        const artistMusicCount = await musicModel.countDocuments({ artist: req.user.id });
        const MAX_UPLOADS_PER_ARTIST = 20;
        if (artistMusicCount >= MAX_UPLOADS_PER_ARTIST) {
            return res.status(403).json({
                message: `Upload limit reached. Max ${MAX_UPLOADS_PER_ARTIST} songs allowed per artist.`
            });
        }

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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to upload music" });
    }
}


async function createAlbum(req, res) {
    try {
        const { title, musics } = req.body;

        if (!title) {
            return res.status(400).json({ message: "title is required" });
        }

        // musics bheja gaya hai toh array hona chahiye, warna galat data DB mein chala jayega
        if (musics && !Array.isArray(musics)) {
            return res.status(400).json({ message: "musics must be an array of music ids" });
        }

        const album = await albumModel.create({
            title,
            artist: req.user.id,
            musics: musics || [],
        });

        res.status(201).json({
            message: "Album created successfully",
            album: {
                id: album._id,
                title: album.title,
                artist: album.artist,
                musics: album.musics,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create album" });
    }
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

async function getAllAlbums(req, res) {
    try {
        const albums = await albumModel.find().select("title artist").populate('artist', 'username email');
        res.status(200).json({
            message: "Albums fetched successfully",
            albums: albums
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch albums" });
    }
}

async function getAlbumById(req, res) {
    try {
        const album = await albumModel.findById(req.params.albumId).populate('artist', 'username email').populate('musics');

        // agar id sahi format ki hai but album exist nahi karta
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }

        res.status(200).json({
            message: "Album fetched successfully",
            album: album
        })
    } catch (error) {
        console.error(error);
        // galat format ka albumId doge toh CastError aayega, wo bhi yahin handle ho jayega
        res.status(500).json({ message: "Failed to fetch album" });
    }
}


module.exports = { createMusic, createAlbum, getAllMusics, getAllAlbums, getAlbumById };