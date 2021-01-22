import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { User, Ajo, Notification } from "../../../models"
import { isEmpty } from "../../../validations"
import { addMember, ajoCode } from "../index"

const { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } = StatusCodes

/**
 * Route for collective saving (Collective Saving - AJO)
 * Request - POST
 * ---------------
 */
const ajo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { reason, target_amount, terminatedAt, members } = req.body
        if (isEmpty(target_amount) || isEmpty(terminatedAt))
            return res.status(BAD_REQUEST).json({
                status: "error",
                message: "Please fill out required fields"
            })

        const membersData = await addMember(User, members, req.user.id, req.user.firstName)

        const newAjo = new Ajo({
            initiator: `${req.user.firstName} ${req.user.lastName}`,
            initiator_phone: req.user.phone,
            initiator_bankCode: "",
            initiator_bank: "",
            initiator_accountNumber: "",
            reason,
            target_amount,
            total_balance: 0,
            total_credit: 0,
            total_debit: 0,
            ajo_code: ajoCode(),
            terminatedAt,
            members: membersData,
            status: true
        })

        const ajoData = await newAjo.save()

        //Notify creator
        const notify = new Notification({
            senderId: req.user.id,
            receiverId: req.user.id,
            read: false,
            type: "Ajo",
            message: `You created AJo account!! Your Ajo Code is - ${ajoData.ajo_code}.`
        })
        await notify.save()
        //Notify members and initiator about joining ajo
        //User needs to confirm before getting added to the ajo list
        return res.status(OK).json({
            status: "success",
            message: "Successfully Retrieved Ajo Members",
            data: {
                reason,
                members: membersData,
                terminatedAt
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Something went wrong"
        })
    }
}

export { ajo }
