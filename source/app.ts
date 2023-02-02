import dotenv from "dotenv"
import express, { Request, Response, NextFunction } from "express"
import cors from "cors"
import HttpStatus from "http-status-codes"
import { ResponseError } from "./error/interface"
import helmet from "helmet"
import { middlewareDetect } from "./Utility"
import fileUpload from "express-fileupload"

//Routes
import { router as AuthenticationRouter } from "./Authentication"
import { router as UserRouter } from "./User"
import { router as PaymentRouter } from "./Payment"

//import error handler
import { handleError } from "./error/index"

dotenv.config()

// initializing the express server
const app = express()
app.use(express.json())

// enabling cors on the server
app.use(cors())

//Configure Helmet
app.use(helmet())

//Device Configurations
app.use(middlewareDetect)

//Uploading file Configurations
app.use(
    fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 }
    })
)

app.use("/auth", AuthenticationRouter)
app.use("/user", UserRouter)
app.use("/pay", PaymentRouter)

// setting fall back route and message for undefined routes
app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new Error("Not found") as ResponseError
    error.status = HttpStatus.NOT_FOUND
    next(error)
})

// setting fall back message for other uncaught errors
app.use((error: { message: string; status: number }, req: Request, res: Response, next: NextFunction) => {
    res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: {
            message: error.message
        }
    })
    next()
})

//Error handler helper
app.use((err: { statusCode: number; message: string }, req: Request, res: Response, next: NextFunction) => {
    handleError({ statusCode: HttpStatus.NOT_FOUND, message: "Route not found!" }, res)
    next()
})

export { app }
