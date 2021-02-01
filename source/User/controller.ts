import { Request, Response } from "express"
import { User } from "../models"
import { StatusCodes } from "http-status-codes"
import { isEmpty, isValidNumber } from "../validations"
import { findUserByHandle, findAllByHandle, BVN } from "../Payment"
import { handleResponse, error, success } from "../Utility"
import { makeGetRequest } from "../Payment/helpers"
import { bizzCode, sendMobileOTP } from "../Authentication"

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

const addBVN = async (req: Request, res: Response): Promise<Response> => {
    let userData
    const { bvn } = req.body

    if (isEmpty(bvn)) return handleResponse(res, error, BAD_REQUEST, "BVN cannot be empty..")
    if (!isValidNumber(bvn)) return handleResponse(res, error, BAD_REQUEST, "Must be a valid Bank Verification Number.")

    try {
        const data = await makeGetRequest(`${BVN}/:${bvn}`)
        const response = data.data
        if (response.status === true) {
            userData = await User.findOne({ handle: req.user.handle })
            const userInfo = response.data
            userData.dateOfBirth = userInfo.formatted_dob
            userData.phone = userInfo.mobile
            userData.phoneTwo = userInfo.mobile2
            userData.bank = userInfo.enrollment_bank.name
            userData.bankCode = userInfo.enrollment_bank.code
            userData.bvn = userInfo.bvn
            userData.bvnBlacklisted = userInfo.is_blacklisted
            userData.sex = userInfo.gender
            userData.address = userInfo.address
            userData.lgaOfAddress = userInfo.lga_of_residence
            userData.stateOfOrigin = userInfo.state_of_origin
            userData.lgaStateOfOrigin = userInfo.lga_of_origin
            userData.bvnOtp = bizzCode()
            const updatedUserData = await userData.save()
            await sendMobileOTP(updatedUserData.bvnOtp)
            return handleResponse(
                res,
                success,
                OK,
                "Bvn retrieved successfully, Please enter Otp to confirm ownership."
            )
        } else {
            return handleResponse(res, error, BAD_REQUEST, response.message)
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

const confirmBVN = async (req: Request, res: Response): Promise<Response> => {
    let userData
    const { bvnOtp } = req.body

    if (isEmpty(bvnOtp)) return handleResponse(res, error, BAD_REQUEST, "BVN cannot be empty..")
    if (typeof bvnOtp === "string") return handleResponse(res, error, BAD_REQUEST, "OTP must be a valid number")

    try {
        userData = userData = await User.findOne({ bvnOtp })
        if (userData) {
            userData.bvnConfirmed = true
        }
        return handleResponse(res, success, OK, "Bvn linked successfully")
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

export { getAllUser, deleteAllUser, activateUser, getUser, addBVN, confirmBVN }
