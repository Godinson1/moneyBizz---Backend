import axios from "axios"
import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { User, Transaction } from "../models"
import { OTP_URL, BALANCE, validateIP, makeRequest } from "./index"

const { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } = StatusCodes

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
            const otpResponse = await makeRequest(OTP_URL, data)

            if (otpResponse) {
                const otpRes = await makeRequest(OTP_URL, data)
                transactionData = await Transaction.findOne({ ref: userData.ref })
                transactionData.status = otpRes.data.data.gateway_response
                transactionData.executedAt = otpRes.data.data.transaction_date
                transactionData.initiator_bank = otpRes.data.data.authorization.bank
                transactionData.executed = true
                const trans = await transactionData.save()
                return res.status(OK).json({
                    status: "success",
                    message: "Payment attempted successfully",
                    data: trans
                })
            } else {
                return res.status(INTERNAL_SERVER_ERROR).json({
                    status: "error",
                    message: "Something went wrong"
                })
            }
        } catch (error) {
            console.log(error)
            return res.status(BAD_REQUEST).json({
                status: "error",
                message: error.response?.data
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

const webhook = async (req: Request, res: Response): Promise<Response> => {
    let userData

    try {
        //@ - Todo
        //Whitelist only requests from paystack
        //Validate amount
        //Create utility functions for different transaction types

        const hash = validateIP(req.body)
        if (hash == req.headers["x-paystack-signature"]) {
            console.log(true)
        } else {
            console.log(false)
        }

        const chargeResponse = req.body
        userData = await User.findOne({ ref: chargeResponse.data.reference })

        if (chargeResponse.event === "charge.success") {
            userData.total_credit += parseInt(chargeResponse.data.amount)
            //const balance = userData.total_credit - userData.total_debit
            userData.total_balance += parseInt(chargeResponse.data.amount)
            userData.available_balance += parseInt(chargeResponse.data.amount)
            await userData.save()
        }

        return res.status(OK)
    } catch (error) {
        console.log("Consoling error", error)
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Something went wrong"
        })
    }
}

const checkBalance = async (req: Request, res: Response): Promise<Response> => {
    try {
        const balanceRes = await axios.get(`${BALANCE}`, {
            headers: {
                Authorization: `Bearer ${process.env.testKey}`,
                "Content-Type": "application/json"
            }
        })

        return res.status(OK).json({
            status: "success",
            data: balanceRes.data
        })
    } catch (error) {
        console.log(error)
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Something went wrong"
        })
    }
}

export { confirmOtp, webhook, checkBalance }
