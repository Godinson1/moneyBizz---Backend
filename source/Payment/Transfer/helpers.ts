import { IUser } from "../../models"
import { findUserByHandle } from "../Savings"
import { bizzMember, RecipientsData, ResData, TransferRes } from "./index"
import { Transaction, Connection } from "../../models"
import { getUserIp, type } from "../../Utility"
import { Request } from "express"

const bizzRecipients = async (array: Array<{ handle: string }>): Promise<Array<bizzMember> | string> => {
    const addedMembers = []
    for (let i = 0; i < array.length; i++) {
        const userData = await findUserByHandle(array[i].handle)
        if (userData) {
            addedMembers.push({
                type: "nuban",
                name: userData.handle,
                account_number: userData.accountNumber,
                bank_code: userData.bankCode,
                currency: "NGN"
            })
        } else {
            return `User with ${array[i].handle} does not exist`
        }
    }
    return addedMembers
}

const createBizzersData = async (
    array: Array<RecipientsData>,
    amount: number,
    reason: string
): Promise<Array<ResData>> => {
    const addedRecipients = []
    for (let i = 0; i < array.length; i++) {
        addedRecipients.push({
            amount,
            recipient: array[i].recipient_code,
            reason
        })
    }
    return addedRecipients
}

const createTransactionAndConnection = async (
    array: Array<TransferRes>,
    user: IUser,
    reason: string,
    req: Request,
    bizzerData: Array<bizzMember>
): Promise<string> => {
    for (let i = 0; i < array.length; i++) {
        const newTransaction = new Transaction({
            initiatorHandle: user.handle,
            initiator_phone: user.phone,
            initiator_bankCode: user.bankCode,
            initiator_bank: user.bank,
            initiator_accountNumber: user.accountNumber,
            recipient: bizzerData[i].name,
            recipient_bank: bizzerData[i].bank_code,
            recipient_accountNumber: bizzerData[i].account_number,
            reason: reason,
            amount: array[i].amount.toString(),
            ref: array[i].transfer_code,
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
            $and: [{ connecteeHandle: { $eq: bizzerData[i].name } }, { connectorHandle: { $eq: user.handle } }]
        })

        //If no connection has been established, create one!
        if (!connectionExist) {
            const newConnection = new Connection({
                connectorID: user.id,
                connectorHandle: user.handle,
                connectee_accountNumber: bizzerData[i].account_number,
                connectee_bank: bizzerData[i].bank_code,
                connectee_profilePhoto: "photo_url",
                connecteeHandle: bizzerData[i].name
            })
            await newConnection.save()
        }

        await newTransaction.save()
    }
    return "Transactions created successfully"
}

const createTransfer = async (user: IUser, bizzerData: IUser, code: string): Promise<void> => {
    const newTransfer = new Connection({
        connectorID: user.id,
        connectorHandle: user.handle,
        connectee_accountNumber: bizzerData.accountNumber,
        connectee_bank: bizzerData.bankCode,
        transferCode: code,
        executed: false,
        connecteeHandle: bizzerData.handle
    })
    await newTransfer.save()

    //Check if connection has been established
    const connectionExist = Connection.findOne({
        $and: [{ connecteeHandle: { $eq: bizzerData.handle } }, { connectorHandle: { $eq: user.handle } }]
    })

    //If no connection has been established, create one!
    if (!connectionExist) {
        const newConnection = new Connection({
            connectorID: user.id,
            connectorHandle: user.handle,
            connectee_accountNumber: bizzerData.accountNumber,
            connectee_bank: bizzerData.bankCode,
            connectee_profilePhoto: bizzerData.profile_photo,
            connecteeHandle: bizzerData.handle
        })
        await newConnection.save()
    }
}

export { bizzRecipients, createBizzersData, createTransfer, createTransactionAndConnection }
