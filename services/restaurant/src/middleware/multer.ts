import multer from "multer"

const storage = multer.memoryStorage()

const uploadFile = multer({storage}).single("file")

export default uploadFile

/*Multer: route pe upload.single("image") middleware lagta hai, aur multer.memoryStorage() se file RAM mein req.file.buffer ban jaati hai.
datauri helper: getBuffer(req.file) buffer ko data URI text mein badalta hai (fileData.content).
Cloudinary: cloudinary.v2.uploader.upload(fileData.content) image upload karta hai aur secure_url return karta hai.
MongoDB: sirf secure_url save kar (jaise restaurant ya menu item ke image field mein), image khud database mein mat daalna.*/