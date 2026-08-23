const express = require("express");
const musicController = require("../controllers/music.controller");
const authMiddleware = require("../middleware/auth.middleware");
const multer = require("multer");

const upload = multer({
     storage: multer.memoryStorage(),
     limits: {
        fileSize: 8 * 1024 * 1024
     },
     fileFilter: (req, file, cb) => {
        if (file.fieldname === 'music' && !file.mimetype.startsWith('audio/')) {
            return cb(new Error('Music file must be an audio file'));
        }
        if (file.fieldname === 'coverImage' && !file.mimetype.startsWith('image/')) {
            return cb(new Error('Cover image must be an image file'));
        }
        cb(null, true);
     }
    });




const router = express.Router();
router.post(
    "/upload",
    authMiddleware.authArtist,
    upload.fields([{ name: "music", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]),
    musicController.createMusic
);

router.post("/album",authMiddleware.authArtist, musicController.createAlbum);

router.get("/",authMiddleware.authUser, musicController.getAllMusics);

router.get("/trending",authMiddleware.authUser, musicController.getTrending);

router.get("/albums",authMiddleware.authUser, musicController.getAllAlbums);

router.get("/albums/:albumId",authMiddleware.authUser, musicController.getAlbumById);

router.post("/:musicId/like",authMiddleware.authUser, musicController.toggleLike);

router.post("/:musicId/play",authMiddleware.authUser, musicController.incrementPlayCount);

router.delete("/:musicId",authMiddleware.authArtist, musicController.deleteMusic);

router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message.includes('must be')) {
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

module.exports = router;