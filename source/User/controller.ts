import { Request, Response } from "express"
import { User, IUser, Transaction } from "../models"
import { StatusCodes } from "http-status-codes"

import { isEmail, isEmpty, validateResetPassword } from "../validations"
import { findUserByHandle, findAllByHandle } from "../Payment"
import { handleResponse, error, success, type } from "../Utility"
import { bizzCode, uniqueCode, sendMobileOTP, validatePhone, sendAuthMail } from "../Authentication"
import bcrypt from "bcryptjs"
import { uploadImage } from "./index"
import { UploadedFile } from "express-fileupload"
import * as schedule from "node-schedule"
import { createNotification } from "../Payment/Savings"

const { OK, INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED, BAD_REQUEST } = StatusCodes

/*
 * NAME - getAllUser
 * REQUEST METHOD - GET
 * AIM - Retrieve all users from database
 */
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

/*
 * NAME - getUser
 * @REQUEST METHOD - GET
 * AIM - Retrieve single user from database
 */
const getUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userData = await findUserByHandle(req.user.handle)
        if (!userData) return handleResponse(res, error, NOT_FOUND, `User with @${req.user.handle} does not exist`)

        const connections = await findAllByHandle("Connection", req.user.handle)
        const transactions = await findAllByHandle("Transaction", req.user.handle)
        const notifications = await findAllByHandle("Notification", req.user.handle)
        const data = {
            details: userData,
            connections,
            transactions,
            notifications,
            secret: `${process.env.pubKey}`
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

/*
 * NAME - deleteAllUser
 * @REQUEST METHOD - DELETE
 * AIM - Delete all users from database
 */
const deleteAllUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        await User.deleteMany({})
        return handleResponse(res, success, OK, "Users data deleted successfully")
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

/*
 * NAME - activateUser
 * @REQUEST METHOD - POST
 * AIM - Activate newly registered user by sending unique code to user email address
 */
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

/*
 * NAME - Verify User
 * @REQUEST METHOD - PUT
 * AIM - Add user active mobile number and date of birth
 * with other info to update user's account
 * Send code to phone number for ownership verification
 */
const VerifyUser = async (req: Request, res: Response): Promise<Response> => {
    let userData
    const { sex, phone, address, stateOrigin, dateOfBirth } = req.body

    try {
        userData = await findUserByHandle(req.user.handle)
        if (userData) {
            userData = await User.findOne({ handle: req.user.handle })
            userData!.dateOfBirth = dateOfBirth
            userData!.phone = phone.toString()
            userData!.sex = sex
            userData!.address = address
            userData!.stateOfOrigin = stateOrigin
            userData!.bvnOtp = uniqueCode()
            const updatedUserData = await userData?.save()
            await sendMobileOTP(updatedUserData.bvnOtp, validatePhone(updatedUserData.phone))
            return handleResponse(
                res,
                success,
                OK,
                "Phone number verified successfully, Please enter Otp to confirm ownership."
            )
        } else {
            return handleResponse(res, error, BAD_REQUEST, "User not found!")
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

/*
 * NAME - confirmBVN
 * @REQUEST METHOD - POST
 * AIM - confirm user active phone with sent code to user's phone
 * If code matches, update bvnConfirmed field else don't update
 */
const confirmUserVerification = async (req: Request, res: Response): Promise<Response | void> => {
    let userData
    const { otp } = req.body

    if (isEmpty(otp.toString())) return handleResponse(res, error, BAD_REQUEST, "OTP cannot be empty..")

    try {
        userData = await User.findOne({ bvnOtp: otp })
        if (userData) {
            userData.bvnConfirmed = true
            await userData.save()
            return handleResponse(res, success, OK, "Phone number linked successfully")
        } else {
            return handleResponse(res, error, BAD_REQUEST, "Invalid OTP provided")
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

/*
 * NAME - resetPassword
 * @REQUEST METHOD - POST
 * AIM - Reset user's password by confirming account through email
 * If account found, send a unique code to reset password
 * If not found, return error message of user with email not found
 */
const resetPassword = async (req: Request, res: Response): Promise<Response> => {
    let userData
    const { email } = req.body

    if (isEmpty(email) || !isEmail(email))
        return handleResponse(res, error, BAD_REQUEST, "Please enter a valid email address")

    try {
        userData = await User.findOne({ email })
        if (userData) {
            userData.mbCode = bizzCode()
            const data = await userData.save()
            await sendAuthMail(type.PASSWORD_RESET, data.mbCode, data.email, data.firstName)
            return handleResponse(res, success, OK, "An email has been sent to the provided email address.")
        } else {
            return handleResponse(res, success, NOT_FOUND, `User with ${email} does not exist`)
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

/*
 * NAME - updatePassword
 * @REQUEST METHOD - POST
 * AIM - Update user's password
 * Provide reset code and new password
 */
const updatePassword = async (req: Request, res: Response): Promise<Response | void> => {
    let userData: IUser | null
    const { mbCode, password } = req.body

    const { valid, errors } = validateResetPassword({
        code: mbCode,
        password
    })

    if (!valid)
        return res.status(BAD_REQUEST).json({
            status: error,
            message: errors
        })

    try {
        userData = await User.findOne({ mbCode })

        if (userData) {
            userData.password = password
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(userData!.password, salt, async (err, hash) => {
                    if (err) throw err
                    userData!.password = hash
                    await userData?.save()
                    return handleResponse(res, success, OK, "Password updated successfully!")
                })
            })
        } else {
            return handleResponse(res, error, BAD_REQUEST, `Invalid reset code provided`)
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

/*
 * NAME - updateProfilePhoto
 * @REQUEST METHOD - PUT
 * AIM - Update user's profile photo
 * Confirm authenticated user and update profile photo
 */
const updateProfilePhoto = async (req: Request, res: Response): Promise<Response> => {
    let userData
    const prefferedTypes = ["image/jpeg", "image/jpg", "image/png"]
    try {
        if (!req.files || req.files === null || Object.keys(req.files).length === 0)
            return handleResponse(res, error, BAD_REQUEST, `Please select a photo`)

        if (req.files.mb_image) {
            const image = req.files.mb_image as UploadedFile
            if (!prefferedTypes.includes(image.mimetype) && userData !== null)
                return handleResponse(res, error, BAD_REQUEST, "Please select a valid photo")
            //Upload image
            const url = await uploadImage(image)
            //Find authenticated user and update photo here
            userData = await findUserByHandle(req.user.handle)
            userData!.profile_photo = url
            const data = await userData?.save()
            return res.status(OK).json({
                status: success,
                message: "Profile photo updated successfully..",
                data
            })
        } else {
            return handleResponse(res, error, BAD_REQUEST, `Please select a photo`)
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

/*
 * NAME - updateAccountDetails
 * @REQUEST METHOD - PUT
 * AIM - Update user's account details - Temporarily
 */
const updateAccountDetails = async (req: Request, res: Response): Promise<Response> => {
    let userData
    const { handle, code, account_number } = req.body
    if (!handle || !code || !account_number)
        return handleResponse(res, error, BAD_REQUEST, `Please fill all required fields`)
    try {
        userData = await findUserByHandle(handle)
        if (userData) {
            userData.bankCode = code
            userData.accountNumber = account_number
            await userData.save()
            return handleResponse(res, success, OK, `Account details updated successfully..`)
        } else {
            return handleResponse(res, error, NOT_FOUND, `User not found`)
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

/*
 * NAME - requestForFund
 * @REQUEST METHOD - POST
 * AIM - Request for funds from fellow bizzers
 */
const requestForFund = async (req: Request, res: Response): Promise<Response> => {
    let userData
    const { handle, message, amount } = req.body
    if (!handle || !message || !amount)
        return handleResponse(res, error, BAD_REQUEST, `Please fill all required fields`)
    try {
        userData = await findUserByHandle(handle)
        if (userData) {
            if (userData.handle === req.user.handle)
                return handleResponse(res, error, BAD_REQUEST, `You can't request for Self Fund`)
            await createNotification(
                req.user.handle,
                handle,
                req.user.firstName,
                "some-id",
                message,
                type.REQUEST_FUND,
                amount
            )
            return handleResponse(res, success, OK, `You successfully requested for fund from @${handle}.`)
        } else {
            return handleResponse(res, error, NOT_FOUND, `User not found`)
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

/*
 * NAME - autoSave
 * @REQUEST METHOD - PUT
 * AIM - Update autosave setting
 */
const autoSave = async (req: Request, res: Response): Promise<Response> => {
    let userData
    const { interval, minute, hour, dayOfMonth, dayOfWeek, amount, active } = req.body

    try {
        userData = await findUserByHandle(req.user.handle)
        if (userData) {
            const data = {
                active,
                interval,
                amount,
                minute,
                hour,
                dayOfMonth,
                dayOfWeek
            }
            userData.autoSave = data
            await userData.save()
            return handleResponse(res, success, OK, `Autosave settings updated successfully..`)
        } else {
            return handleResponse(res, error, NOT_FOUND, `You can't carry out this operation.`)
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

/*
 * NAME - autoSave
 * @REQUEST METHOD - PUT
 * AIM - Update autosave setting
 */
const switchAutoSave = async (req: Request, res: Response): Promise<Response> => {
    let userData
    const { active } = req.body

    try {
        userData = await findUserByHandle(req.user.handle)
        if (userData) {
            const existingJob = schedule.scheduledJobs[req.user.email]
            if (existingJob === null || existingJob === undefined) {
                return handleResponse(res, error, BAD_REQUEST, `Autosave settings not initiated.`)
            } else {
                existingJob.cancel()
                userData.autoSave.active = active
                await userData.save()
                return handleResponse(res, success, OK, `Autosave turned off successfully..`)
            }
        } else {
            return handleResponse(res, error, NOT_FOUND, `You can't carry out this operation.`)
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

const getTransactions = async (req: Request, res: Response): Promise<Response> => {
    const pagination = req.body.pagination ? parseInt(req.body.pagination) : 10
    //PageNumber From which Page to Start
    const pageNumber = req.body.page ? parseInt(req.body.page) : 1
    try {
        const data = await Transaction.find({ userId: req.user.userId })
        const data_result = await Transaction.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pagination)
            .limit(pagination)
        const data_length = data.length
        const num = data_length / pagination
        const total_page = Number.isInteger(num) === true ? num : Math.ceil(num)

        return res.status(200).send({
            status: "success",
            message: "Data retrieved successfully.",
            total_result: data_length,
            total_page,
            data: data_result
        })
    } catch (err) {
        console.log(err)
        return handleResponse(res, "error", 500, "Something went wrong")
    }
}

const checkCron = async (req: Request, res: Response): Promise<Response> => {
    const runningJobs = await schedule.scheduledJobs
    console.log(runningJobs)
    return res.status(200).json({ message: "All running jobs for autosave" })
}

export {
    getAllUser,
    deleteAllUser,
    updateProfilePhoto,
    updatePassword,
    activateUser,
    getUser,
    confirmUserVerification,
    VerifyUser,
    resetPassword,
    requestForFund,
    updateAccountDetails,
    autoSave,
    switchAutoSave,
    getTransactions,
    checkCron
}
