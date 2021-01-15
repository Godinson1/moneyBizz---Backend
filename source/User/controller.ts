import { Request, Response } from "express"
import { User } from "../models"
import { StatusCodes } from "http-status-codes"

const { OK, INTERNAL_SERVER_ERROR } = StatusCodes

const getAllUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const data = await User.find({})
        return res.status(OK).json({
            status: "success",
            message: "Users data retrieved successfully",
            data
        })
    } catch (error) {
        console.log(error)
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Something went wrong"
        })
    }
}

const deleteAllUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        await User.deleteMany({})
        return res.status(OK).json({
            status: "success",
            message: "Users data deleted successfully"
        })
    } catch (error) {
        console.log(error)
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Something went wrong"
        })
    }
}

export { getAllUser, deleteAllUser }
