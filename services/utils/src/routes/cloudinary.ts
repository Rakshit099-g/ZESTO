import express from "express"
import cloudinary from "cloudinary"
const router = express.Router()
router.post("/upload", async (req, res) => {
    try {
        const { buffer } = req.body
        const cloud = await cloudinary.v2.uploader.upload(buffer)
        res.json({
            url: cloud.secure_url,
        });
    } catch (error: any) {
        console.log("Cloudinary error:", error);        // terminal ke liye
        res.status(500).json({
            message: error?.message || "Error in cloudinary",   // frontend/toast ke liye
        })
    }
})
export default router