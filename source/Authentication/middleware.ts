import jwt from "jsonwebtoken"
import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { handleResponse, error } from "../Utility"

const { UNAUTHORIZED, BAD_REQUEST } = StatusCodes

const auth = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.header("mb-token") as string

    try {
        if (!token) handleResponse(res, error, UNAUTHORIZED, "Sorry, No Authorization!")
        const decodedToken = jwt.verify(token, `${process.env.jwt_secret}`)
        req.user = decodedToken as string
        next()
    } catch (e) {
        if (!token) handleResponse(res, error, BAD_REQUEST, "Invalid Token")
    }
}

export { auth }
