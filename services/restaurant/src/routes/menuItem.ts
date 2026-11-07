import express from "express"
import { isAuth, isSeller } from "../middleware/isAuth.js";
import { addMenuItems, deleteItems, getAllItems, toggleMenuItemAvailability } from "../controllers/menuItems.js";
import uploadFile from "../middleware/multer.js";
const router = express.Router();

router.post('/new',isAuth,isSeller,uploadFile,addMenuItems)
router.get('/all/:id',isAuth,getAllItems)
router.delete('/:itemId',isAuth,isSeller,deleteItems)
router.put("/status/:itemId",isAuth,isSeller,toggleMenuItemAvailability)
export default router