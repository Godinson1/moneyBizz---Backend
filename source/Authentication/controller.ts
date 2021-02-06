import { Request, Response } from "express"
import { validateLogin, validateReg } from "../validations"
import { StatusCodes } from "http-status-codes"
import { User } from "../models/"
import { jwtSignUser, sendAuthMail, bizzCode } from "./index"
import bcrypt from "bcryptjs"
import { handleResponse, error, success, type } from "../Utility"

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, CREATED, OK } = StatusCodes

const registerUser = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { email, firstName, lastName, handle, password } = req.body

        const { errors, valid } = validateReg({
            email,
            firstName,
            lastName,
            handle,
            password
        })

        if (!valid)
            return res.status(BAD_REQUEST).json({
                status: error,
                message: errors
            })

        const alreadyExist = await User.findOne({ $or: [{ email: { $eq: email } }, { handle: { $eq: handle } }] })
        if (alreadyExist) return handleResponse(res, error, BAD_REQUEST, `User with email/handle already exist`)

        const newUser = new User({
            firstName,
            lastName,
            dateOfBirth: "",
            phone: "",
            password,
            email,
            address: "",
            sex: "",
            ref: "",
            lgaOfAddress: "",
            phoneTwo: "",
            stateOfOrigin: "",
            bank: "",
            bankCode: "",
            accountNumber: "",
            authorization: {},
            bvn: "",
            bvnOtp: "",
            bvnConfirmed: false,
            bvnBlacklisted: true,
            lgaStateOfOrigin: "",
            handle,
            profile_photo: "",
            nameOfNextOfKin: "",
            phoneOfNextOfKin: "",
            total_balance: 0,
            total_credit: 0,
            total_debit: 0,
            available_balance: 0,
            mbCode: bizzCode(),
            active: false
        })

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, async (err, hash) => {
                if (err) throw err
                newUser.password = hash
                const data = await newUser.save()
                const token = jwtSignUser(data)
                await sendAuthMail(type.WELCOME, data.mbCode, email, firstName)
                return res.status(CREATED).json({
                    status: success,
                    token,
                    message: "Successfully registered"
                })
            })
        })
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

const loginUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { data, password } = req.body

        const { errors, valid } = validateLogin({
            data,
            password
        })

        if (!valid)
            return res.status(BAD_REQUEST).json({
                status: error,
                message: errors
            })

        const userData = await User.findOne({ $or: [{ email: { $eq: data } }, { handle: { $eq: data } }] })

        if (!userData) return handleResponse(res, error, BAD_REQUEST, `User with ${data} does not exist`)

        const isMatched = await bcrypt.compare(password, userData.password)
        if (!isMatched) return handleResponse(res, error, BAD_REQUEST, "Invalid Credentials")

        const token = jwtSignUser(userData)
        return res.status(OK).json({
            status: success,
            token,
            message: "Successfully Signed in"
        })
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

export { registerUser, loginUser }
