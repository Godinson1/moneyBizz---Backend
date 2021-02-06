import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { User } from "../../models"
import { CREATE_RECIPIENT, BULK_RECIPIENT, TRANSFER, BULK_TRANSFER } from "../index"
import { handleResponse, success, error, source, type } from "../../Utility"
import { isEmpty } from "../../validations"
import { transferFund, createRecipient, findUserByHandle, createTransaction } from "../Savings"
import { bizzRecipients, createTransactionAndConnection, createTransfer, createBizzersData } from "./index"

const { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST, NOT_FOUND } = StatusCodes

/**
 * Name - singleTransfer - FUND BIZZER
 * @Description - Route for crediting bizzer account
 * Request - POST
 * Accepts users handle, validate and send fund to attached bank account
 */
const singleTransfer = async (req: Request, res: Response): Promise<Response | void> => {
    let userData
    const { amount, handle, reason } = req.body

    //Check for empty field
    if (isEmpty(amount.toString()) || isEmpty(handle))
        return handleResponse(res, error, BAD_REQUEST, "Please provide all required fields")

    try {
        //Check for valid authenticated user
        userData = await User.findOne({ _id: req.user.id })
        if (!userData) return handleResponse(res, error, BAD_REQUEST, "You can't carry out this operation..")

        //Check for existing bizzer handle
        const bizzerData = await findUserByHandle(handle)
        if (!bizzerData) return handleResponse(res, error, NOT_FOUND, `Bizzer with @${handle} not found`)

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
            name: `${bizzerData.firstName} ${bizzerData.lastName}`,
            account_number: bizzerData.accountNumber,
            bank_code: bizzerData.bankCode,
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
                    reason
                })
                const transferRes = await transferFund(TRANSFER, transferParams)
                //Initiate transaction
                if (transferRes.status) {
                    await createTransaction(
                        userData,
                        req,
                        amount,
                        transferRes.data.transfer_code,
                        type.TRANSFER,
                        reason
                    )
                    await createTransfer(userData, bizzerData, transferRes.data.transfer_code)
                    return handleResponse(res, success, OK, `You successfully sent money to ${bizzerData.handle}`)
                }
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
 * Name - bulkTransfer - GIVE AWAY!
 * @Description - Route for crediting multiple users at a Go
 * Request - POST
 * Accepts users handles, validate and send funds to attached bank account
 */
const bulkTransfer = async (req: Request, res: Response): Promise<Response | void> => {
    let userData
    const { amount, reason, bizzers } = req.body

    //Check for empty field
    if (isEmpty(amount.toString())) return handleResponse(res, error, BAD_REQUEST, "Amount must not be empty")

    //Check for empty bizzers list
    if (bizzers.length > 1) {
        try {
            //Check for valid authenticated user
            userData = await User.findOne({ _id: req.user.id })
            if (!userData) return handleResponse(res, error, BAD_REQUEST, "You can't carry out this operation..")

            //Check for sufficient balance
            if (amount * bizzers.lenghth > userData.available_balance)
                return handleResponse(
                    res,
                    error,
                    BAD_REQUEST,
                    "Insufficient Fund: Kindly top up your bizz wallet to carry out this transaction"
                )

            const data = await bizzRecipients(bizzers)
            if (typeof data === "string") return handleResponse(res, error, BAD_REQUEST, data)

            //Create recipients params
            const recipientParams = JSON.stringify({
                batch: data
            })

            try {
                const recipient = await createRecipient(BULK_RECIPIENT, recipientParams)
                //Create helper function to send transfer data

                const bizzersData = createBizzersData(recipient.data.success, amount, reason)

                //Check if recipient status is true
                if (recipient.status) {
                    //Create transfer params
                    const transferParams = JSON.stringify({
                        currency: "NGN",
                        source: "balance",
                        transfers: bizzersData
                    })
                    const transferRes = await transferFund(BULK_TRANSFER, transferParams)
                    if (transferRes.status) {
                        //Create transaction and connection if not exist for each of the bizzers
                        await createTransactionAndConnection(transferRes.data, userData, reason, req, data)
                        return handleResponse(
                            res,
                            success,
                            OK,
                            `You just rained on ${(await bizzersData).length} bizzers`
                        )
                    }
                }
            } catch (err) {
                return handleResponse(res, error, BAD_REQUEST, err.response.data.message)
            }
        } catch (err) {
            console.log(err)
            return handleResponse(res, error, INTERNAL_SERVER_ERROR, "Something went wrong")
        }
    } else {
        return handleResponse(res, error, BAD_REQUEST, "You must select more than one bizzer to use this feature")
    }
}

export { singleTransfer, bulkTransfer }
