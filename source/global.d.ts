import { DetectResult, ResultBot } from "node-device-detector"
//import { requestUser } from "./Utility"

declare global {
    namespace Express {
        export interface Request {
            user: any //requestUser | string
            useragent: string
            bot: ResultBot
            device: DetectResult
        }
    }
}

declare module "node-schedule"

export {}
