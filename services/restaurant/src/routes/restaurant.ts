import express from "express"
import { isAuth, isSeller } from "../middleware/isAuth.js";
import uploadFile from "../middleware/multer.js";
import { addRestaurant, fetchMyRestaurant ,updateStatusRestaurant, saveChanges } from "../controllers/restaurant.js";
const router = express.Router();

router.post("/new",isAuth,isSeller,uploadFile,addRestaurant)
router.get("/my",isAuth,isSeller,fetchMyRestaurant)
router.put("/status",isAuth,isSeller,updateStatusRestaurant)
router.put("/edit",isAuth,isSeller,saveChanges)
export default router