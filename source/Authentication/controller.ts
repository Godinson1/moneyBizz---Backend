import { Request, Response } from "express"
import { validateLogin, validateReg } from "../validations"
import { StatusCodes } from "http-status-codes"
import { User } from "../models/"
import { jwtSignUser, sendWelcomeMailWithCode, bizzCode } from "./index"
import bcrypt from "bcryptjs"

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, CREATED } = StatusCodes

const registerUser = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { email, firstName, lastName, phone, password } = req.body

        const { errors, valid } = validateReg({
            email,
            firstName,
            lastName,
            phone,
            password
        })

        if (!valid)
            return res.status(BAD_REQUEST).json({
                status: "error",
                message: errors
            })

        const alreadyExist = await User.findOne({ email })
        if (alreadyExist)
            return res.status(BAD_REQUEST).json({
                status: "error",
                message: `User with ${email} already exist`
            })

        const newUser = new User({
            firstName,
            lastName,
            dateOfBirth: "",
            phone,
            password,
            email,
            address: "",
            sex: "",
            handle: `${firstName}_${lastName}`,
            profile_photo: "",
            nameOfNextOfKin: "",
            phoneOfNextOfKin: "",
            total_balance: 0,
            total_debits: "",
            available_balance: 0,
            connections: [],
            transactions: [],
            mbCode: bizzCode(),
            active: false
        })

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, async (err, hash) => {
                if (err) throw err
                newUser.password = hash
                const data = await newUser.save()
                const token = jwtSignUser(data)
                await sendWelcomeMailWithCode(data.mbCode, email, firstName)
                return res.status(CREATED).json({
                    status: "success",
                    token,
                    message: "Successfully registered"
                })
            })
        })
    } catch (error) {
        console.log(error)
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Something went wrong"
        })
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
                status: "error",
                message: errors
            })

        const userData = await User.findOne({ $or: [{ email: { $eq: data } }, { phone: { $eq: data } }] })

        if (!userData)
            return res.status(BAD_REQUEST).json({
                status: "error",
                message: `User with ${data} does not exist`
            })

        const isMatched = await bcrypt.compare(password, userData.password)
        if (!isMatched) res.status(400).json({ message: "Invalid Credentials" })

        const token = jwtSignUser(userData)
        return res.status(CREATED).json({
            status: "success",
            token,
            message: "Successfully Signed in"
        })
    } catch (error) {
        console.log(error)
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Something went wrong"
        })
    }
}

export { registerUser, loginUser }
