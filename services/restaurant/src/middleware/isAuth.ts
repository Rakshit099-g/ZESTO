import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import TryCatch from "./trycatch.js";

export type Role = "rider" | "seller" | "customer";


export interface AuthenticatedRequest extends Request {
    user?: { _id: string; role: Role | null };
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
        req.user = { _id: decodedValue.userId, role: decodedValue.role ?? null };
        next();
    } catch {
        res.status(401).json({ message: "Please Login - Invalid or expired token" });
    }
};

export const isSeller = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user
    if (user && user.role !== "seller") {
        res.status(403).json({
            message: "you are not authorized seller"

        });
        return

    }
    next()
}