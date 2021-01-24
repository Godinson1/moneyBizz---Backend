import { Request, Response, NextFunction } from "express"
import DeviceDetector, { ResultBot } from "node-device-detector"

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

interface requestUser {
    id: string
    handle: string
    phone: string
    firstName: string
    lastName: string
    email: string
}

export { getUserIp, middlewareDetect, hasBotResult, requestUser }
