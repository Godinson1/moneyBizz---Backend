import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { User, Transaction, Transfer, IUser } from "../models"
import { OTP_URL, BALANCE, validateAmount, makeGetRequest, makeRequest } from "./index"
import { handleResponse, success, error, type, APPROVED } from "../Utility"
import { sendTransactionMail } from "../Authentication"
import { createNotification, createTransaction } from "./Savings"

const { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } = StatusCodes

const confirmOtp = async (req: Request, res: Response): Promise<Response> => {
    let transactionData
    const { otp } = req.body
    try {
        try {
            const userData = await User.findOne({ _id: req.user.id })
            transactionData = await Transaction.findOne({ ref: userData?.ref })
            if (!userData) return handleResponse(res, error, BAD_REQUEST, "You can't carry out this operation..")

            const data = JSON.stringify({
                otp,
                reference: userData.ref
            })
            const otpResponse = await makeRequest(OTP_URL, data)

            if (otpResponse && transactionData !== null) {
                const otpRes = await makeRequest(OTP_URL, data)
                transactionData.executedAt = otpRes.data.data.transaction_date
                transactionData.initiator_bank = otpRes.data.data.authorization.bank
                transactionData.executed = true
                const trans = await transactionData.save()

                return res.status(OK).json({
                    status: success,
                    message: "Payment attempted successfully",
                    data: trans
                })
            } else {
                return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
            }
        } catch (err: any) {
            console.log(err)
            return res.status(BAD_REQUEST).json({
                status: error,
                message: err?.response?.data
            })
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

const webhook = async (req: Request, res: Response): Promise<Response> => {
    let userData: IUser | null
    let transactionData
    let transferData

    try {
        //@ - Todo
        //Whitelist only requests from paystack - Headers
        //Create utility functions for different transaction types
        //--------------------------------------------------------
        //--------------------------------------------------------

        //const isValidIP = checkIp(req.body.data.ip_address)
        res.status(OK)
        //if (!isValidIP) {
        const chargeResponse = req.body
        userData = await User.findOne({ email: chargeResponse.data.customer.email })
        if (chargeResponse.data.channel === "card") {
            await createTransaction(
                userData,
                req,
                chargeResponse.data.amount.toString(),
                chargeResponse.data.reference,
                type.FUND
            )
            if (userData?.authorization.length === 0) {
                userData?.authorization.push(chargeResponse.data.authorization)
            }
        }
        transactionData = await Transaction.findOne({ ref: userData?.ref })
        if (chargeResponse.data.channel === "card" && transactionData !== null) {
            transactionData.executedAt = chargeResponse.data.transaction_date
            transactionData.initiator_bank = chargeResponse.data.authorization.bank
            transactionData.executed = true
            await transactionData.save()
        }
        transferData = await Transfer.findOne({ transferCode: chargeResponse.data.transfer_code })
        const amount = validateAmount(chargeResponse.data.amount.toString())

        if (
            chargeResponse.event === "charge.success" &&
            userData !== null &&
            transactionData !== null &&
            transactionData.status !== APPROVED
        ) {
            userData.total_credit += amount
            const balance = userData.total_credit - userData.total_debit
            userData.total_balance = balance
            userData.available_balance = balance
            transactionData.status = chargeResponse.data.gateway_response

            await userData.save()
            await transactionData.save()
            await sendTransactionMail(
                type.FUND,
                userData.email,
                userData.firstName,
                chargeResponse.data.amount.toString(),
                chargeResponse.data.reference,
                transactionData?.reason,
                chargeResponse.data.paid_at
            )
        }

        if (chargeResponse.event === "transfer.success" && userData !== null) {
            userData.total_debit += amount
            const balance = userData.total_credit - userData.total_debit
            userData.total_balance = balance
            userData.available_balance = balance
            await userData.save()
            await sendTransactionMail(
                type.DEBIT,
                userData.email,
                userData.firstName,
                chargeResponse.data.amount.toString(),
                chargeResponse.data.transfer_code,
                transactionData?.reason,
                chargeResponse.data.created_at
            )
            await createNotification(
                type.TRANSFER,
                userData.handle,
                transferData?.recipientHandle,
                userData.firstName,
                transferData?.id,
                chargeResponse.data.reference,
                amount
            )
        }

        if (chargeResponse.event === "charge.failure" && transactionData !== null) {
            transactionData.status = "Failed"
            transactionData.executed = false
            await transactionData.save()
        }
        //} else {
        //console.log("Not from paystack")
        //}

        return res.status(OK)
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

const checkBalance = async (req: Request, res: Response): Promise<Response> => {
    try {
        const balanceRes = await makeGetRequest(BALANCE)
        return res.status(OK).json({
            status: success,
            data: balanceRes.data
        })
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

export { confirmOtp, webhook, checkBalance }
