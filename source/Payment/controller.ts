import axios from "axios"
import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { User, Transaction } from "../models"
import { CHARGE_URL, OTP_URL } from "./index"

const { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } = StatusCodes

const fundAccount = async (req: Request, res: Response): Promise<Response> => {
    let userData
    const { amount, code, account_number } = req.body

    const data = JSON.stringify({
        email: req.user.email,
        amount,
        bank: {
            code,
            account_number
        },
        birthday: "1995-12-23"
    })

    try {
        try {
            userData = await User.findOne({ _id: req.user.id })
            if (!userData) {
                return res.status(BAD_REQUEST).json({
                    status: "error",
                    message: "You can't carry out this operation.."
                })
            }

            const chargeResponse = await axios.post(`${CHARGE_URL}`, data, {
                headers: {
                    Authorization: `Bearer ${process.env.testKey}`,
                    "Content-Type": "application/json"
                }
            })

            if (chargeResponse) {
                const newTransaction = new Transaction({
                    initiator: `${req.user.firstName} ${req.user.lastName}`,
                    initiator_phone: req.user.phone,
                    initiator_bankCode: code,
                    initiator_bank: "",
                    initiator_accountNumber: account_number,
                    recipient: "self",
                    recipient_bank: "self",
                    recipient_accountNumber: "self",
                    reason: "Top up wallet",
                    amount,
                    ref: chargeResponse.data.data.reference,
                    executedAt: Date.now(),
                    createdAt: Date.now(),
                    executed: false,
                    status: "in-process"
                })
                userData.ref = chargeResponse.data.data.reference
                await userData.save()
                await newTransaction.save()
            }
            return res.status(OK).json({
                status: "success",
                message: "Payment attempted successfully",
                data: chargeResponse.data
            })
        } catch (error) {
            console.log(error)
            return res.status(BAD_REQUEST).json({
                status: "error",
                message: "Paystack: An error occured.."
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

const confirmOtp = async (req: Request, res: Response): Promise<Response> => {
    let transactionData
    const { otp } = req.body
    try {
        try {
            const userData = await User.findOne({ _id: req.user.id })
            const data = JSON.stringify({
                otp,
                reference: userData.ref
            })
            const otpResponse = await axios.post(`${OTP_URL}`, data, {
                headers: {
                    Authorization: `Bearer ${process.env.testKey}`,
                    "Content-Type": "application/json"
                }
            })
            console.log(otpResponse.data)
            transactionData = await Transaction.findOne({ ref: userData.ref })
            transactionData.status = otpResponse.data.data.gateway_response
            transactionData.executedAt = otpResponse.data.data.transaction_date
            transactionData.initiator_bank = otpResponse.data.data.authorization.bank
            transactionData.executed = true
            await transactionData.save()
            return res.status(OK).json({
                status: "success",
                message: "Payment attempted successfully",
                data: otpResponse.data
            })
        } catch (error) {
            console.log(error)
            return res.status(BAD_REQUEST).json({
                status: "error",
                message: error.response.data
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

//Todo - To connfirm payment with either charge.success or charge.failure
//before updating user's account
const webhook = (req: Request, res: Response): void => {
    try {
        const event = req.body
        console.log(event)
        res.send(200)

        res.status(OK).json({
            status: "success",
            message: "Good feedback"
        })
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Something went wrong"
        })
    }
}

export { fundAccount, confirmOtp, webhook }
