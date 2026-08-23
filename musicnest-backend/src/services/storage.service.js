const {ImageKit} = require('@imagekit/nodejs'); //Import the ImageKit module for image uploading and management


const ImageKitClient = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
})

async function uploadFile (file, folder = "yt-complete-backend/music"){
    const result = await ImageKitClient.files.upload({
        file,
        fileName:"file_" + Date.now(),
        folder
    })
    return result;

}

// fileId ImageKit ka diya hua unique id hai (upload response mein "fileId" field se milta hai)
async function deleteFile(fileId){
    if(!fileId) return; // agar fileId hi nahi hai toh kuch mat karo
    try{
        await ImageKitClient.files.delete(fileId);
    } catch(err){
        // agar file already deleted hai ya ImageKit pe nahi mili, DB delete ko block mat karo
        console.error("ImageKit delete failed:", err.message);
    }
}

module.exports ={uploadFile, deleteFile}