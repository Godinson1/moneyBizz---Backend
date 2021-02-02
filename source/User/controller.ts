import { Request, Response } from "express"
import { User, IUser } from "../models"
import { StatusCodes } from "http-status-codes"
import { isEmail, isEmpty, isValidNumber, validateResetPassword } from "../validations"
import { findUserByHandle, findAllByHandle, BVN } from "../Payment"
import { handleResponse, error, success, type } from "../Utility"
import { makeGetRequest } from "../Payment/helpers"
import { bizzCode, uniqueCode, sendMobileOTP, sendAuthMail } from "../Authentication"
import bcrypt from "bcryptjs"
import { uploadImage } from "./index"
import { UploadedFile } from "express-fileupload"

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
 * NAME - addBVN
 * @REQUEST METHOD - POST
 * AIM - Add user bvn and update user's account
 * Send code to phone number associated with bvn for ownership verification
 */
const addBVN = async (req: Request, res: Response): Promise<Response> => {
    let userData
    const { bvn } = req.body

    if (isEmpty(bvn.toString())) return handleResponse(res, error, BAD_REQUEST, "BVN cannot be empty..")
    if (!isValidNumber(bvn.toString()))
        return handleResponse(res, error, BAD_REQUEST, "Must be a valid Bank Verification Number.")
    if (typeof bvn === "number")
        return handleResponse(res, error, BAD_REQUEST, "Abeg, submit string make I no block you!")

    try {
        const bvnExist = await findUserByHandle(req.user.handle)
        if (bvnExist) {
            if (bvnExist.bvn === bvn) {
                return handleResponse(res, error, BAD_REQUEST, "Bvn already linked with bizz account")
            } else {
                const data = await makeGetRequest(`${BVN}/${bvn}`)
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
                    userData.address = userInfo.residential_address
                    userData.lgaOfAddress = userInfo.lga_of_residence
                    userData.stateOfOrigin = userInfo.state_of_origin
                    userData.lgaStateOfOrigin = userInfo.lga_of_origin
                    userData.bvnOtp = uniqueCode()
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
            }
        } else {
            return handleResponse(res, error, BAD_REQUEST, "We no see this one o. Omo!")
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

/*
 * NAME - confirmBVN
 * @REQUEST METHOD - POST
 * AIM - confirm user bvn with sent code to user's phone
 * If code matches, update bvnConfirmed field else don't update
 */
const confirmBVN = async (req: Request, res: Response): Promise<Response | void> => {
    let userData
    const { bvnOtp } = req.body

    if (isEmpty(bvnOtp.toString())) return handleResponse(res, error, BAD_REQUEST, "BVN cannot be empty..")
    if (typeof bvnOtp === "string") return handleResponse(res, error, BAD_REQUEST, "OTP must be a valid number")

    try {
        userData = await User.findOne({ bvnOtp })
        console.log(userData)
        if (userData) {
            userData.bvnConfirmed = true
            await userData.save()
            return handleResponse(res, success, OK, "Bvn linked successfully")
        } else {
            return handleResponse(res, success, OK, "Invalid OTP provided")
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
            return handleResponse(res, success, OK, `User with ${email} does not exist`)
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
    let userData: IUser
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
                bcrypt.hash(userData.password, salt, async (err, hash) => {
                    if (err) throw err
                    userData.password = hash
                    await userData.save()
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
    try {
        if (!req.files || req.files === null || Object.keys(req.files).length === 0)
            return handleResponse(res, error, BAD_REQUEST, `Please select a photo`)

        if (req.files.mb_image) {
            console.log(req.files.mb_image)
            //Add more validations - so users don't post anything aside pictures
            const image = req.files.mb_image as UploadedFile
            const url = await uploadImage(image)
            //Update user photo here
            return handleResponse(res, success, OK, url)
        } else {
            return handleResponse(res, error, BAD_REQUEST, `Please select a photo`)
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

export {
    getAllUser,
    deleteAllUser,
    updateProfilePhoto,
    updatePassword,
    activateUser,
    getUser,
    addBVN,
    confirmBVN,
    resetPassword
}
