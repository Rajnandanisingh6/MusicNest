const {ImageKit} = require('@imagekit/nodejs'); //Import the ImageKit module for image uploading and management


const ImageKitClient = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
})

async function uploadFile (file){
    const result = await ImageKitClient.upload({
        file,
        fileName:"music_" + Date.now(),
        folder : "yt-complete-backend/music"
    })
    return result;

}

module.exports ={uploadFile}
