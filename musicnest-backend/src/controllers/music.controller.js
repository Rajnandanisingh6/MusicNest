const musicModel = require('../models/music.model');
const albumModel = require('../models/album.model');
const { uploadFile, deleteFile } = require('../services/storage.service');
const { parseBuffer } = require('music-metadata');

async function createMusic(req, res) {
    try {
        const { title } = req.body;
        const musicFile = req.files?.music?.[0];
        const coverFile = req.files?.coverImage?.[0];

        if (!musicFile) {
            return res.status(400).json({ message: "music file is required" });
        }
        if (!title) {
            return res.status(400).json({ message: "title is required" });
        }

        const artistMusicCount = await musicModel.countDocuments({ artist: req.user.id });
        const MAX_UPLOADS_PER_ARTIST = 20;
        if (artistMusicCount >= MAX_UPLOADS_PER_ARTIST) {
            return res.status(403).json({
                message: `Upload limit reached. Max ${MAX_UPLOADS_PER_ARTIST} songs allowed per artist.`
            });
        }

        const result = await uploadFile(musicFile.buffer.toString('base64'), "yt-complete-backend/music");

        let coverImageData = undefined;

        if (coverFile) {
            // artist ne khud cover image di hai, usi ko use karo
            const coverResult = await uploadFile(coverFile.buffer.toString('base64'), "yt-complete-backend/covers");
            coverImageData = { url: coverResult.url, fileId: coverResult.fileId };
        } else {
            // koi cover nahi di — mp3 ke andar hi embedded album art hoti hai kya, wo check karo
            try {
                const metadata = await parseBuffer(musicFile.buffer, musicFile.mimetype);
                const embeddedPicture = metadata.common.picture?.[0];
                if (embeddedPicture) {
                    const coverResult = await uploadFile(
                        Buffer.from(embeddedPicture.data).toString('base64'),
                        "yt-complete-backend/covers"
                    );
                    coverImageData = { url: coverResult.url, fileId: coverResult.fileId };
                }
            } catch (metaErr) {
                console.error("Could not read embedded cover art:", metaErr.message);
                // ye fail ho toh bhi upload rukna nahi chahiye — frontend gradient placeholder dikha dega
            }
        }

        const music = await musicModel.create({
            uri: result.url,
            fileId: result.fileId,
            title,
            artist: req.user.id,
            coverImage: coverImageData,
        });

        res.status(201).json({
            message: "Music created successfully",
            music: {
                id: music._id,
                uri: music.uri,
                title: music.title,
                artist: music.artist,
                coverImage: music.coverImage?.url || null,
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

        // frontend ke liye har song mein likeCount aur ye user ne like kiya hai ya nahi, add karo
        const musicsWithMeta = musics.map(m => ({
            ...m.toObject(),
            likeCount: m.likes.length,
            isLiked: req.user ? m.likes.some(id => id.toString() === req.user.id) : false,
        }));

        return res.status(200).json({
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            musics: musicsWithMeta
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch music",
            error: error.message
        });
    }
};

// sabse zyada liked/played songs — "Trending" section ke liye
const getTrending = async (req, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 10, 20);

        const musics = await musicModel
            .find()
            .populate("artist", "username email")
            .lean();

        // ek simple trending score: likes ka zyada weight, plays ka kam
        const sorted = musics
            .map(m => ({
                ...m,
                likeCount: m.likes.length,
                trendingScore: (m.likes.length * 3) + m.playCount,
            }))
            .sort((a, b) => b.trendingScore - a.trendingScore)
            .slice(0, limit);

        res.status(200).json({ musics: sorted });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch trending music" });
    }
};

async function toggleLike(req, res) {
    try {
        const music = await musicModel.findById(req.params.musicId);
        if (!music) {
            return res.status(404).json({ message: "Music not found" });
        }

        const userId = req.user.id;
        const alreadyLiked = music.likes.some(id => id.toString() === userId);

        if (alreadyLiked) {
            music.likes = music.likes.filter(id => id.toString() !== userId);
        } else {
            music.likes.push(userId);
        }

        await music.save();

        res.status(200).json({
            message: alreadyLiked ? "Unliked" : "Liked",
            likeCount: music.likes.length,
            isLiked: !alreadyLiked,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update like" });
    }
}

async function incrementPlayCount(req, res) {
    try {
        const music = await musicModel.findByIdAndUpdate(
            req.params.musicId,
            { $inc: { playCount: 1 } },
            { new: true }
        );
        if (!music) {
            return res.status(404).json({ message: "Music not found" });
        }
        res.status(200).json({ playCount: music.playCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update play count" });
    }
}

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

        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }

        res.status(200).json({
            message: "Album fetched successfully",
            album: album
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch album" });
    }
}

async function deleteMusic(req, res) {
    try {
        const music = await musicModel.findById(req.params.musicId);

        if (!music) {
            return res.status(404).json({ message: "Music not found" });
        }

        if (music.artist.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only delete your own music" });
        }

        await deleteFile(music.fileId);
        if (music.coverImage?.fileId) {
            await deleteFile(music.coverImage.fileId);
        }

        await musicModel.findByIdAndDelete(req.params.musicId);

        res.status(200).json({ message: "Music deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete music" });
    }
}


module.exports = { createMusic, createAlbum, getAllMusics, getAllAlbums, getAlbumById, deleteMusic, getTrending, toggleLike, incrementPlayCount };