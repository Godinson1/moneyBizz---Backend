import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { User, Transaction } from "../../../models"
import { CHARGE_URL, makeRequest } from "../../index"
import { getUserIp } from "../../../Utility"

const { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } = StatusCodes

/**
 * Route for funding user wallet (Personal Saving)
 * Request - POST
 * Validate request and attempt transaction
 */
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

            const chargeResponse = await makeRequest(CHARGE_URL, data)

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
                    deviceIp: getUserIp(req),
                    deviceType: req.device.client.name,
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

export { fundAccount }
