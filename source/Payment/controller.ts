import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { User, Transaction } from "../models"
import { OTP_URL, BALANCE, validateIP, validateAmount, makeGetRequest, makeRequest } from "./index"
import { handleResponse, success, error, type } from "../Utility"
import { sendTransactionMail } from "../Authentication"

const { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } = StatusCodes

const confirmOtp = async (req: Request, res: Response): Promise<Response> => {
    let transactionData
    const { otp } = req.body
    try {
        try {
            const userData = await User.findOne({ _id: req.user.id })
            if (!userData) return handleResponse(res, error, BAD_REQUEST, "You can't carry out this operation..")

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
                //This mail will be sent from the webhook endpoint
                //After payment has been confirmed.. Currently testing here..
                await sendTransactionMail(
                    type.FUND,
                    userData.email,
                    userData.firstName,
                    trans.amount,
                    trans.ref,
                    trans.reason,
                    trans.executedAt
                )
                return res.status(OK).json({
                    status: success,
                    message: "Payment attempted successfully",
                    data: trans
                })
            } else {
                return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
            }
        } catch (err) {
            console.log(err)
            return res.status(BAD_REQUEST).json({
                status: error,
                message: err.response?.data
            })
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

const webhook = async (req: Request, res: Response): Promise<Response> => {
    let userData
    let transactionData

    try {
        //@ - Todo
        //Whitelist only requests from paystack
        //Validate amount
        //Create utility functions for different transaction types
        //--------------------------------------------------------
        /*
         *For bulk transfer, check the response returned first
         *I can create an array field in users model that holds
         *references of bulk transfers just like I did with the reference field
         *for single transfer. Then map through and check each reference against that
         *of the response returned from the webhook.
         *Add total amount and store in debit, make calculation and debit user (initiator)
         *Then send user(initiator) transaction mail of total amount sent to handle
         *Send notification to user(initiator) and bizzers(beneficiaries or recipients)
         */
        //--------------------------------------------------------

        const hash = validateIP(req.body)
        if (hash == req.headers["x-paystack-signature"]) {
            console.log(true)
        } else {
            console.log(false)
        }

        const chargeResponse = req.body
        userData = await User.findOne({ ref: chargeResponse.data.reference })
        transactionData = await Transaction.findOne({ ref: userData.ref })

        const amount = validateAmount(chargeResponse.data.amount)

        if (chargeResponse.event === "charge.success") {
            userData.total_credit += amount
            const balance = userData.total_credit - userData.total_debit
            userData.total_balance = balance
            userData.available_balance = balance
            userData.authorization = chargeResponse.data.authorization
            await userData.save()
            await sendTransactionMail(
                type.FUND,
                userData.email,
                userData.firstName,
                chargeResponse.data.amount,
                chargeResponse.data.reference,
                transactionData.reason,
                chargeResponse.data.paid_at
            )
        }

        if (chargeResponse.event === "transfer.success") {
            userData.total_debit += amount
            const balance = userData.total_credit - userData.total_debit
            userData.total_balance = balance
            userData.available_balance = balance
            await userData.save()
            await sendTransactionMail(
                type.DEBIT,
                userData.email,
                userData.firstName,
                chargeResponse.data.amount,
                chargeResponse.data.transfer_code,
                transactionData.reason,
                chargeResponse.data.created_at
            )
        }

        if (chargeResponse.event === "charge.failure") {
            transactionData.status = "Failed"
            transactionData.executed = false
            await transactionData.save()
        }

        return res.status(OK)
    } catch (err) {
        console.log("Consoling error", err)
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
