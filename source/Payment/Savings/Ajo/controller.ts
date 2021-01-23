import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { Ajo, IAjoMember } from "../../../models"
import { isEmpty } from "../../../validations"
import { addMember, ajoCode, notifyMembers, addNewMember } from "../index"

const { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = StatusCodes

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

        const membersData = await addMember(members)

        const newAjo = new Ajo({
            createdBy: `${req.user.handle}`,
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

        await notifyMembers(members, ajoData._id, req.user.firstName, req.user.handle, ajoData.ajo_code)

        return res.status(OK).json({
            status: "success",
            message: "Successfully Created Ajo",
            data: {
                createdBy: ajoData.createdBy,
                ajoCode: ajoData.ajo_code,
                reason: ajoData.reason,
                members: ajoData.members,
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

        ajoData = await Ajo.findOne({ ajo_code })
        if (!ajoData)
            return res.status(NOT_FOUND).json({
                status: "error",
                message: "Ajo account not found"
            })

        const ajoIndex = ajoData.members.findIndex((member: IAjoMember) => member.phone === req.user.phone)
        if (ajoIndex === -1) {
            return res.status(NOT_FOUND).json({
                status: "error",
                message: "You are not a member of this Ajo account"
            })
        }

        if (ajoData.members[ajoIndex].active === true) {
            return res.status(BAD_REQUEST).json({
                status: "error",
                message: "You are already an active member of this Ajo account"
            })
        }

        await Ajo.updateOne(
            { ajo_code: ajoData.ajo_code, "members.handle": req.user.handle },
            { $set: { "members.$.active": true } }
        )

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

const retrieveAjo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const ajoData = await Ajo.findOne({ ajo_code: req.params.id })
        console.log(req.params.id)
        console.log(ajoData)
        if (!ajoData)
            return res.status(NOT_FOUND).json({
                status: "error",
                message: "Ajo account not found"
            })

        return res.status(OK).json({
            status: "success",
            message: "Successfully Retrieved Ajo",
            data: ajoData
        })
    } catch (error) {
        console.log(error)
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Something went wrong"
        })
    }
}

const addAjoMember = async (req: Request, res: Response): Promise<Response> => {
    const { members } = req.body
    try {
        const ajoData = await Ajo.findOne({ ajo_code: req.params.id })
        if (!ajoData)
            return res.status(NOT_FOUND).json({
                status: "error",
                message: "Ajo account not found"
            })

        if (members.length === 0) {
            return res.status(BAD_REQUEST).json({
                status: "error",
                message: "You need to add atleast one member"
            })
        }

        //Update ajo interface and model and add hostId to perform check
        //instead of using full name of host..
        if (ajoData.createdBy !== `${req.user.handle}`) {
            return res.status(UNAUTHORIZED).json({
                status: "error",
                message: "You are not authorised to perform this action"
            })
        }

        const data = await addNewMember(members, ajoData.ajo_code, req.user.handle, req.user.firstName)
        if (typeof data === "string") {
            return res.status(BAD_REQUEST).json({
                status: "error",
                message: data
            })
        }

        data.forEach((ajoMember) => {
            ajoData.members.push(ajoMember)
        })

        const newAjoData = await ajoData.save()

        return res.status(OK).json({
            status: "success",
            message: "Successfully Added Ajo Member(s)",
            data: newAjoData
        })
    } catch (error) {
        console.log(error)
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Something went wrong"
        })
    }
}

export { ajo, activateAjo, retrieveAjo, addAjoMember }
