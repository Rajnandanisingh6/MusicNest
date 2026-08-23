const express = require("express");
const musicController = require("../controllers/music.controller");
const authMiddleware = require("../middleware/auth.middleware");
const multer = require("multer");

const upload = multer({
     storage: multer.memoryStorage(),  // Store the uploaded file in memory as a buffer
     limits: {
        fileSize: 8 * 1024 * 1024 // ek file max 8MB ki honi chahiye, isse ImageKit quota jaldi khatam nahi hogi
     },
     fileFilter: (req, file, cb) => {
        // sirf audio files accept karo, koi bhi file type nahi
        if (!file.mimetype.startsWith('audio/')) {
            return cb(new Error('Only audio files are allowed'));
        }
        cb(null, true);
     }
    });




const router = express.Router();
router.post("/upload",authMiddleware.authArtist,upload.single("music"), musicController.createMusic);

router.post("/album",authMiddleware.authArtist, musicController.createAlbum);

router.get("/",authMiddleware.authUser, musicController.getAllMusics);

router.get("/albums",authMiddleware.authUser, musicController.getAllAlbums);

router.get("/albums/:albumId",authMiddleware.authUser, musicController.getAlbumById);

// multer error (file bahut badi hai, ya galat file type) ko sahi JSON response mein convert karta hai
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message === 'Only audio files are allowed') {
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

module.exports = router;