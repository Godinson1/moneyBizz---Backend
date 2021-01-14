import { Response } from "express"

class ErrorHandler extends Error {
    statusCode: number
    constructor(statusCode: number, message: string) {
        super()
        this.statusCode = statusCode
        this.message = message
    }
}

const handleError = async (err: { statusCode: number; message: string }, res: Response): Promise<Response> => {
    const { statusCode, message } = err
    return res.status(statusCode).json({
        status: "error",
        message
    })
}
export { handleError, ErrorHandler }
