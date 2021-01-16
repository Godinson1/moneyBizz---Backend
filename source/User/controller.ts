import { Request, Response } from "express"
import { User } from "../models"
import { StatusCodes } from "http-status-codes"
import { isEmpty } from "../validations"

const { OK, INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED, BAD_REQUEST } = StatusCodes

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

const activateUser = async (req: Request, res: Response): Promise<Response> => {
    let userData
    const { code } = req.body

    if (isEmpty(code))
        return res.status(BAD_REQUEST).json({
            status: "error",
            message: "Activation code cannot be empty.."
        })

    try {
        userData = await User.findOne({ mbCode: code })
        if (!userData)
            return res.status(NOT_FOUND).json({
                status: "error",
                message: "Invalid Code, Please check code and try again"
            })

        if (req.user.id === userData.id) {
            userData.active = true
            await userData.save()
            return res.status(OK).json({
                status: "success",
                message: "Users account activated successfully"
            })
        } else {
            return res.status(UNAUTHORIZED).json({
                status: "error",
                message: "You are not Authorised to perform this operation"
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Something went wrong"
        })
    }
}

export { getAllUser, deleteAllUser, activateUser }
