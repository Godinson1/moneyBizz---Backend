import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { User, Ajo, Notification, IAjoMember } from "../../../models"
import { isEmpty } from "../../../validations"
import { addMember, ajoCode } from "../index"

const { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST, NOT_FOUND } = StatusCodes

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
        return res.status(OK).json({
            status: "success",
            message: "Successfully Created Ajo",
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

const activateAjo = async (req: Request, res: Response): Promise<Response> => {
    let ajoData
    try {
        const { ajo_code } = req.body
        if (isEmpty(ajo_code))
            return res.status(BAD_REQUEST).json({
                status: "error",
                message: "Please fill out required fields"
            })

        ajoData = Ajo.findOne({ ajo_code })
        if (!ajoData)
            return res.status(NOT_FOUND).json({
                status: "error",
                message: "Ajo account not found"
            })

        ajoData.members.map(async (member: IAjoMember) => {
            if (member.phone === req.user.phone) {
                member.active = true
            }
        })

        await ajoData.save()

        return res.status(OK).json({
            status: "success",
            message: "Successfully Activated Ajo"
        })
    } catch (error) {
        console.log(error)
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Something went wrong"
        })
    }
}

export { ajo, activateAjo }
