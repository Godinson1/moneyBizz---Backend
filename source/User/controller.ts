import { Request, Response } from "express"
import { User, IUser } from "../models"
import { StatusCodes } from "http-status-codes"
import { isEmail, isEmpty, isValidNumber, validateResetPassword } from "../validations"
import { findUserByHandle, findAllByHandle, BVN } from "../Payment"
import { handleResponse, error, success, type } from "../Utility"
import { makeGetRequest } from "../Payment/helpers"
import { bizzCode, uniqueCode, sendMobileOTP, validatePhone, sendAuthMail } from "../Authentication"
import bcrypt from "bcryptjs"
import { uploadImage } from "./index"
import { UploadedFile } from "express-fileupload"
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
 * LOCKED TEMPORARILY!!!
 * NAME - addBVN
 * @REQUEST METHOD - POST
 * AIM - Add user bvn and update user's account
 * Send code to phone number associated with bvn for ownership verification
 */
const addBVN = async (req: Request, res: Response): Promise<any> => {
    /*let userData
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
                    //Using or "" because I ain't checking for all user's bvn yet
                    userData = await User.findOne({ handle: req.user.handle })
                    const userInfo = response.data
                    userData.dateOfBirth = userInfo.formatted_dob || ""
                    userData.phone = userInfo.mobile || ""
                    userData.phoneTwo = userInfo.mobile2 || ""
                    userData.bank = userInfo.enrollment_bank.name || ""
                    userData.bankCode = userInfo.enrollment_bank.code || ""
                    userData.bvn = userInfo.bvn || ""
                    userData.bvnBlacklisted = userInfo.is_blacklisted || ""
                    userData.sex = userInfo.gender || ""
                    userData.address = userInfo.residential_address || ""
                    userData.lgaOfAddress = userInfo.lga_of_residence || ""
                    userData.stateOfOrigin = userInfo.state_of_origin || ""
                    userData.lgaStateOfOrigin = userInfo.lga_of_origin || ""
                    userData.bvnOtp = uniqueCode()
                    const updatedUserData = await userData.save()
                    await sendMobileOTP(updatedUserData.bvnOtp, validatePhone(updatedUserData.phoneTwo))
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
    }*/
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
            if (!prefferedTypes.includes(image.mimetype))
                return handleResponse(res, error, BAD_REQUEST, "Please select a valid photo")
            //Upload image
            const url = await uploadImage(image)
            //Find authenticated user and update photo here
            userData = await findUserByHandle(req.user.handle)
            userData.profile_photo = url
            const data = await userData.save()
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
            return handleResponse(res, success, OK, `Auto feature updated successfully..`)
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
            userData.autoSave.active = active
            await userData.save()
            return handleResponse(res, success, OK, `Auto feature updated successfully..`)
        } else {
            return handleResponse(res, error, NOT_FOUND, `You can't carry out this operation.`)
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
    confirmBVN,
    addBVN,
    resetPassword,
    requestForFund,
    updateAccountDetails,
    autoSave,
    switchAutoSave
}
