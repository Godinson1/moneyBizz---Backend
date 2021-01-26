import { Request, Response } from "express"
import { User } from "../models"
import { StatusCodes } from "http-status-codes"
import { isEmpty } from "../validations"
import { findUserByHandle, findAllByHandle } from "../Payment"
import { handleResponse, error, success } from "../Utility"

const { OK, INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED, BAD_REQUEST } = StatusCodes

const getAllUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const data = await User.find({})
        return res.status(OK).json({
            status: success,
            message: "Users data retrieved successfully",
            data
        })
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

const getUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userData = await findUserByHandle(req.params.id)
        if (!userData) return handleResponse(res, error, NOT_FOUND, `Users with @${req.params.id} does not exist`)

        const connections = await findAllByHandle("Connection", req.params.id)
        const transactions = await findAllByHandle("Transaction", req.params.id)
        const notifications = await findAllByHandle("Notification", req.params.id)
        const data = {
            details: userData,
            connections,
            transactions,
            notifications
        }

        return res.status(OK).json({
            status: success,
            message: "User data retrieved successfully",
            data
        })
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

const deleteAllUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        await User.deleteMany({})
        return handleResponse(res, success, OK, "Users data deleted successfully")
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

const activateUser = async (req: Request, res: Response): Promise<Response> => {
    let userData
    const { code } = req.body

    if (isEmpty(code)) return handleResponse(res, error, BAD_REQUEST, "Activation code cannot be empty..")

    try {
        userData = await User.findOne({ mbCode: code })
        if (!userData) return handleResponse(res, error, NOT_FOUND, "Invalid Code, Please check code and try again")
        if (userData.active === true) return handleResponse(res, error, BAD_REQUEST, "Account already activated")

        if (req.user.id === userData.id) {
            userData.active = true
            await userData.save()
            return handleResponse(res, success, OK, "Users account activated successfully")
        } else {
            return handleResponse(res, error, UNAUTHORIZED, "You are not Authorised to perform this operation")
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

export { getAllUser, deleteAllUser, activateUser, getUser }
