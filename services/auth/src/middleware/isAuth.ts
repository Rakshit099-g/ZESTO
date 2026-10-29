import { Request, Response, NextFunction } from "express"
import User, { IUser } from "../model/User.js";
import jwt, { JwtPayload } from "jsonwebtoken"
import TryCatch from "./trycatch.js";

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies?.accessToken as string | undefined;
        if (!token) {
            res.status(401).json({ message: "Please Login - No access token" })
            return
        }

        const decodedValue = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload
        if (!decodedValue || !decodedValue.userId) {
            res.status(401).json({ message: "Invalid Token" })
            return
        }

        const user = await User.findById(decodedValue.userId)
        if (!user) {
            res.status(401).json({ message: "User Not Found" })
            return
        }

        req.user = user
        next()
    }
    catch (error) {
        res.status(401).json({ message: "Please Login - Invalid or expired token" })
    }
}

const allowedRoles = ["rider", "seller", "customer"] as const
type Role = (typeof allowedRoles)[number]

export const addUserRole = TryCatch(async (req, res) => {
    if (!req.user?._id) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { role } = req.body as { role: Role };
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid Role" })
    }
    const user = await User.findByIdAndUpdate(req.user._id, { role }, { new: true })
    if (!user) {
        return res.status(404).json({ message: "User Not Found" })
    }
    res.json({ user })
})