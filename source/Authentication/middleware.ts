import jwt from "jsonwebtoken"
import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

const { UNAUTHORIZED, BAD_REQUEST } = StatusCodes

const auth = (req: Request, res: Response, next: NextFunction): any => {
    const token = req.header("mb-token")

    try {
        if (!token)
            return res.status(UNAUTHORIZED).json({
                status: "error",
                message: "Sorry, No Authorization!"
            })
        const decodedToken = jwt.verify(token, `${process.env.jwt_secret}`)
        req.user = decodedToken
        next()
    } catch (e) {
        return res.status(BAD_REQUEST).json({
            status: "error",
            message: "Invalid Token"
        })
    }
}

export { auth }
