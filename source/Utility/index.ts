import { Request, Response, NextFunction } from "express"
import DeviceDetector, { ResultBot } from "node-device-detector"
import { connectToTestDB } from "./test"

const deviceDetector = new DeviceDetector()

const getUserIp = (req: Request): string => {
    let ip
    if (req.headers["x-forwarded-for"]) {
        ip = (req.headers["x-forwarded-for"] as string).split(",")[0]
    } else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress
    } else {
        ip = req.ip
    }
    return ip
}

const middlewareDetect = (req: Request, res: Response, next: NextFunction): void => {
    const useragent = req.headers["user-agent"] as string
    req.useragent = useragent
    req.device = deviceDetector.detect(useragent)
    req.bot = deviceDetector.parseBot(useragent)
    next()
}

const hasBotResult = (result: ResultBot): string => {
    return result && result.name
}

const handleResponse = async (res: Response, status: string, code: number, message: string): Promise<Response> => {
    return res.status(code).json({
        status,
        message
    })
}

interface requestUser {
    id: string
    handle: string
    phone: string
    firstName: string
    lastName: string
    email: string
}

const error = "error"
const success = "success"

export { error, success, getUserIp, connectToTestDB, middlewareDetect, hasBotResult, handleResponse, requestUser }
