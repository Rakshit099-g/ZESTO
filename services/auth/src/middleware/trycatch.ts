import { Response, NextFunction, RequestHandler } from "express"

const TryCatch = (
    handler: (req: any, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next)
        } catch (err: any) {
            res.status(500).json({ message: err.message })
        }
    }
}

export default TryCatch