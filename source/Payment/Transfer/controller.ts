import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { User, Transaction, Connection } from "../../models"
import { CREATE_RECIPIENT, BULK_RECIPIENT, TRANSFER, BULK_TRANSFER } from "../index"
import { getUserIp, handleResponse, success, error, source, type } from "../../Utility"
import { isEmpty } from "../../validations"
import { transferFund, createRecipient, findUserByHandle } from "../Savings"
import { bizzRecipients, recipientResponse, createBizzersData } from "./index"

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
                    const newTransaction = new Transaction({
                        initiatorHandle: `${req.user.handle}`,
                        initiator_phone: userData.phone,
                        initiator_bankCode: userData.bankCode,
                        initiator_bank: "",
                        initiator_accountNumber: userData.accountNumber,
                        recipient: bizzerData.handle,
                        recipient_bank: bizzerData.bank,
                        recipient_accountNumber: bizzerData.accountNumber,
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
                        type: type.TRANSFER
                    })

                    //Check if connection has been established
                    const connectionExist = Connection.findOne({
                        $and: [
                            { connecteeHandle: { $eq: bizzerData.handle } },
                            { connectorHandle: { $eq: userData.handle } }
                        ]
                    })

                    //If no connection has been established, create one!
                    if (!connectionExist) {
                        const newConnection = new Connection({
                            connectorID: userData.id,
                            connectorHandle: userData.handle,
                            connectee_accountNumber: bizzerData.accountNumber,
                            connectee_bank: bizzerData.bankCode,
                            connectee_profilePhoto: bizzerData.profile_photo,
                            connecteeHandle: bizzerData.handle
                        })
                        await newConnection.save()
                    }

                    //Save transaction reference and save
                    userData.ref = transferRes.data.transfer_code
                    await userData.save()
                    await newTransaction.save()
                }

                return handleResponse(res, success, OK, `You successfully sent money to ${bizzerData.handle}`)
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
            if (amount > userData.available_balance)
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
                console.log(bizzersData)
                //Check if recipient status is true
                if (recipient.status) {
                    //Create transfer params
                    const transferParams = JSON.stringify({
                        currency: "NGN",
                        source: "balance",
                        transfers: bizzersData
                    })
                    const transferRes = await transferFund(BULK_TRANSFER, transferParams)
                    //Initiate transaction
                    //Map through each bizzer to create each transaction
                    if (transferRes.status) {
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
