import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { User, Transaction } from "../../../models"
import { CHARGE_URL, CREATE_RECIPIENT, TRANSFER, makeRequest } from "../../index"
import { getUserIp, handleResponse, success, error, source, type } from "../../../Utility"
import { isEmpty } from "../../../validations"
import { transferFund, createRecipient } from "../../Savings"

const { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } = StatusCodes

/**
 * Route for funding user wallet (Personal Saving)
 * Request - POST
 * Validate request and attempt transaction
 */
const fundAccount = async (req: Request, res: Response): Promise<Response> => {
    let userData
    const { amount, code, account_number } = req.body

    if (isEmpty(amount) || isEmpty(code) || isEmpty(account_number))
        return handleResponse(res, error, BAD_REQUEST, "Please provide all required fields")

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
            if (!userData) return handleResponse(res, error, BAD_REQUEST, "You can't carry out this operation..")

            const chargeResponse = await makeRequest(CHARGE_URL, data)

            if (chargeResponse) {
                const newTransaction = new Transaction({
                    initiatorHandle: `${req.user.handle}`,
                    initiator_phone: "",
                    initiator_bankCode: code,
                    initiator_bank: "",
                    initiator_accountNumber: account_number,
                    recipient: "self",
                    recipient_bank: "self",
                    recipient_accountNumber: "self",
                    reason: "Top up wallet",
                    amount,
                    ref: chargeResponse.data.data.reference,
                    deviceIp: getUserIp(req),
                    deviceInfo: {
                        device: req.device,
                        userAgent: req.useragent
                    },
                    executedAt: Date.now(),
                    createdAt: Date.now(),
                    executed: false,
                    status: "in-process",
                    type: type.FUND
                })
                userData.ref = chargeResponse.data.data.reference
                await userData.save()
                await newTransaction.save()
            }
            return res.status(OK).json({
                status: success,
                message: "Payment attempted successfully",
                data: chargeResponse.data
            })
        } catch (err) {
            console.log(err)
            return handleResponse(res, error, BAD_REQUEST, "Paystack: An error occured..")
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

/**
 * @Description - Route for debiting user wallet (Personal Saving)
 * Request - POST
 * Validate request and debit user account
 */
const debitAccount = async (req: Request, res: Response): Promise<Response | void> => {
    let userData
    const { amount, code, account_number } = req.body

    //Check for empty field
    if (isEmpty(amount.toString()) || isEmpty(code) || isEmpty(account_number))
        return handleResponse(res, error, BAD_REQUEST, "Please provide all required fields")

    try {
        //Check for valid authenticated user
        userData = await User.findOne({ _id: req.user.id })
        if (!userData) return handleResponse(res, error, BAD_REQUEST, "You can't carry out this operation..")

        //Check for sufficient balance
        if (amount > userData.available_balance)
            return handleResponse(
                res,
                error,
                BAD_REQUEST,
                "Insufficient Fund: Kindly top up your bizz wallet to carry out this transaction"
            )

        //Create recipient params
        const recipientParams = JSON.stringify({
            type: "nuban",
            name: `${req.user.firstName} ${req.user.lastName}`,
            account_number,
            bank_code: code,
            currency: "NGN"
        })

        try {
            const recipient = await createRecipient(CREATE_RECIPIENT, recipientParams)

            //Check if recipient status is true
            if (recipient.status) {
                //Create transfer params
                const transferParams = JSON.stringify({
                    source,
                    amount,
                    recipient: recipient.data.recipient_code,
                    reason: "Personal Debit - Bizz Wallet"
                })
                const transferRes = await transferFund(TRANSFER, transferParams)
                //Initiate transaction
                if (transferRes.status) {
                    const newTransaction = new Transaction({
                        initiatorHandle: `${req.user.handle}`,
                        initiator_phone: userData.phone,
                        initiator_bankCode: code,
                        initiator_bank: "",
                        initiator_accountNumber: account_number,
                        recipient: "self",
                        recipient_bank: "self",
                        recipient_accountNumber: "self",
                        reason: transferRes.data.reason,
                        amount: transferRes.data.amount.toString(),
                        ref: transferRes.data.transfer_code,
                        deviceIp: getUserIp(req),
                        deviceInfo: {
                            device: req.device,
                            userAgent: req.useragent
                        },
                        executedAt: Date.now(),
                        createdAt: Date.now(),
                        executed: false,
                        status: "in-process",
                        type: type.DEBIT
                    })
                    userData.ref = transferRes.data.transfer_code
                    await userData.save()
                    await newTransaction.save()
                }

                return handleResponse(res, success, OK, "Bizz wallet debited successfully")
            }
        } catch (err) {
            return handleResponse(res, error, BAD_REQUEST, err.response.data.message)
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

export { fundAccount, debitAccount }
