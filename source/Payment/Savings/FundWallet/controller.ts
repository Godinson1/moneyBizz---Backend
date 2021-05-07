import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { IUser, User } from "../../../models"
import {
    CHARGE_URL,
    INITIALIZE_TRANSACTION,
    CHARGE_AUTHORIZATION,
    CREATE_RECIPIENT,
    TRANSFER,
    makeRequest
} from "../../index"
import { handleResponse, success, error, source, type } from "../../../Utility"
import { isEmpty } from "../../../validations"
import { transferFund, createRecipient, chargeUser } from "../../Savings"
import { createTransaction } from "../index"
import cron from "node-cron"

const { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST, NOT_FOUND } = StatusCodes

/**
 * Route for funding user wallet with bank account (Personal Saving)
 * Request - POST
 * Validate request and attempt transaction
 */
const fundAccountWithBankAccount = async (req: Request, res: Response): Promise<Response> => {
    let userData
    const { amount, code, account_number } = req.body

    if (isEmpty(amount) || isEmpty(code) || isEmpty(account_number))
        return handleResponse(res, error, BAD_REQUEST, "Please provide all required fields")

    const data = JSON.stringify({
        email: req.user.email,
        amount,
        bank: {
            code,
            account_number,
            phone: "+2348100000000",
            token: "123456"
        },
        birthday: "1995-12-23"
    })

    try {
        try {
            userData = await User.findOne({ _id: req.user.id })
            if (!userData) return handleResponse(res, error, NOT_FOUND, "You can't carry out this operation..")

            const chargeResponse = await makeRequest(CHARGE_URL, data)
            if (chargeResponse) {
                await createTransaction(userData, req, amount, chargeResponse.data.data.reference, type.FUND)
            }
            return res.status(OK).json({
                status: success,
                message: "Payment attempted successfully",
                data: chargeResponse.data
            })
        } catch (err) {
            return handleResponse(res, error, BAD_REQUEST, err.response.data.message)
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

/**
 * Route for funding user wallet with card (Personal Saving)
 * Request - POST
 * Validate request and attempt transaction
 */
const fundAccountWithCard = async (req: Request, res: Response): Promise<Response> => {
    let userData
    const { amount } = req.body

    if (isEmpty(amount)) return handleResponse(res, error, BAD_REQUEST, "Amount must not be empty..")

    const data = JSON.stringify({
        email: req.user.email,
        amount
    })

    try {
        try {
            userData = await User.findOne({ _id: req.user.id })
            if (!userData) return handleResponse(res, error, NOT_FOUND, "You can't carry out this operation..")

            const chargeResponse = await makeRequest(INITIALIZE_TRANSACTION, data)
            if (chargeResponse) {
                await createTransaction(userData, req, amount, chargeResponse.data.data.reference, type.FUND)
            }
            return res.status(OK).json({
                status: success,
                message: "Payment attempted successfully",
                data: chargeResponse.data
            })
        } catch (err) {
            return handleResponse(res, error, BAD_REQUEST, err.response.data.message)
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

/**
 * Route for funding user wallet with existing card (Personal Saving)
 * Request - POST
 * Validate request and attempt transaction
 */
const fundAccountWithExistingCard = async (req: Request, res: Response): Promise<Response | void> => {
    let userData
    const { amount } = req.body

    if (isEmpty(amount)) return handleResponse(res, error, BAD_REQUEST, "Amount must not be empty..")

    try {
        try {
            userData = await User.findOne({ _id: req.user.id })
            if (!userData) return handleResponse(res, error, NOT_FOUND, "You can't carry out this operation..")

            if (userData.authorization && Object.keys(userData.authorization).length !== 0) {
                const params = JSON.stringify({
                    email: req.user.email,
                    amount,
                    authorization_code: userData.authorization[0].authorization_code
                })

                const chargeResponse = await makeRequest(CHARGE_AUTHORIZATION, params)
                if (chargeResponse.data.status) {
                    await createTransaction(userData, req, amount, chargeResponse.data.data.reference, type.FUND)
                    return res.status(OK).json({
                        status: success,
                        message: "Payment attempted successfully",
                        data: chargeResponse.data
                    })
                }
            } else {
                return handleResponse(
                    res,
                    error,
                    NOT_FOUND,
                    "Authorization not found. Kindly initiate a transaction to get one."
                )
            }
        } catch (err) {
            console.log(err)
            return handleResponse(res, error, BAD_REQUEST, err.response.data.message)
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
        if (!userData) return handleResponse(res, error, NOT_FOUND, "You can't carry out this operation..")

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
                    await createTransaction(
                        userData,
                        req,
                        amount.toString(),
                        transferRes.data.transfer_code,
                        type.TRANSFER,
                        transferRes.data.reason
                    )
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

/**
 * @Description - Route for debiting user wallet (Personal Saving)
 * Request - POST
 * Validate request and debit user account
 */
const autoFundAccount = async (req: Request, res: Response): Promise<Response | void> => {
    let userData: IUser
    const { interval, minute, hour, dayOfMonth, dayOfWeek, amount } = req.body

    if (isEmpty(amount.toString())) return handleResponse(res, error, BAD_REQUEST, "Amount must not be empty..")

    try {
        try {
            userData = await User.findOne({ _id: req.user.id })
            if (!userData) return handleResponse(res, error, NOT_FOUND, "You can't carry out this operation..")

            if (userData.authorization && Object.keys(userData.authorization).length !== 0) {
                if (Object.keys(userData.autoSave).length === 0)
                    return handleResponse(res, error, NOT_FOUND, "Please update your auto save setting.")

                const data = {
                    interval,
                    minute,
                    hour,
                    dayOfMonth,
                    dayOfWeek,
                    amount,
                    active: true
                }
                userData.autoSave = data

                if (interval === "daily") {
                    cron.schedule(`${minute} ${hour} * * *`, async () => {
                        console.log("Testing User User")
                        const chargeResponse = await chargeUser(userData, req, amount)
                        if (typeof chargeResponse === "string")
                            return handleResponse(res, error, NOT_FOUND, chargeResponse)
                        if (chargeResponse.data.status) {
                            return res.status(OK).json({
                                status: success,
                                message: "Payment attempted successfully",
                                data: chargeResponse.data
                            })
                        }
                    })
                } else if (interval === "weekly") {
                    cron.schedule(`${minute} ${hour} * * ${dayOfWeek}`, async () => {
                        console.log("Testing User User")
                        const chargeResponse = await chargeUser(userData, req, amount)
                        if (typeof chargeResponse === "string")
                            return handleResponse(res, error, NOT_FOUND, chargeResponse)
                        if (chargeResponse.data.status) {
                            return res.status(OK).json({
                                status: success,
                                message: "Payment attempted successfully",
                                data: chargeResponse.data
                            })
                        }
                    })
                } else if (interval === "monthly") {
                    cron.schedule(`${minute} ${hour} ${dayOfMonth} * *`, async () => {
                        console.log("Testing User User")
                    })
                    const chargeResponse = await chargeUser(userData, req, amount)
                    if (typeof chargeResponse === "string") return handleResponse(res, error, NOT_FOUND, chargeResponse)
                    if (chargeResponse.data.status) {
                        return res.status(OK).json({
                            status: success,
                            message: "Payment attempted successfully",
                            data: chargeResponse.data
                        })
                    }
                } else if (interval === "testing") {
                    cron.schedule(`${minute} * * * *`, async () => {
                        console.log("Testing User User")
                    })
                    const chargeResponse = await chargeUser(userData, req, amount)
                    if (typeof chargeResponse === "string") return handleResponse(res, error, NOT_FOUND, chargeResponse)
                    if (chargeResponse.data.status) {
                        return res.status(OK).json({
                            status: success,
                            message: "Payment attempted successfully",
                            data: chargeResponse.data
                        })
                    }
                }
            } else {
                return handleResponse(
                    res,
                    error,
                    NOT_FOUND,
                    "Authorization not found. Kindly initiate a transaction to get one."
                )
            }
        } catch (err) {
            console.log(err)
            return handleResponse(res, error, BAD_REQUEST, err.response.data.message)
        }
    } catch (err) {
        console.log(err)
        return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
    }
}

export { fundAccountWithBankAccount, debitAccount, autoFundAccount, fundAccountWithExistingCard, fundAccountWithCard }
