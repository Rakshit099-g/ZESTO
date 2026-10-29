import express from "express"
import { loginUser,myProfile,refreshAccessToken,logoutUser } from "../controllers/auth.js";
import { addUserRole, isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/login",loginUser)
router.put("/add/role",isAuth,addUserRole)
router.post("/refresh", refreshAccessToken);

router.get("/me",isAuth,myProfile)
router.post("/logout", logoutUser);

export default router;

