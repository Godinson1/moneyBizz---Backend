import {
    IUser,
    IAjoMember,
    Notification,
    User,
    Ajo,
    Transaction,
    INotification,
    IConnection,
    ITransaction,
    Connection
} from "../../../models"
import { Result } from "./interface"
import { type } from "../../../Utility"
import { formatter, validateAmount } from "../../../Authentication"

const addMember = async (array: Array<{ handle: string }>, handle: string): Promise<Array<IAjoMember>> => {
    const addedMembers = []
    for (let i = 0; i < array.length; i++) {
        const userData = await findUserByHandle(array[i].handle)
        if (userData) {
            addedMembers.push({
                name: `${userData.firstName} ${userData.lastName}`,
                phone: userData.phone,
                handle: userData.handle,
                bank: userData.bank || null,
                bankCode: userData.bankCode || null,
                accountNumber: userData.accountNumber || null,
                total_debit: 0,
                total_credit: 0,
                ajo_code: "",
                active: userData.handle === handle ? true : false
            })
        }
    }
    return addedMembers
}

const ajoCode = (): string => {
    return `ajo_${Math.floor(100000 + Math.random() * 900000)}`
}

const notifyMembers = async (
    array: Array<{ handle: string }>,
    ajoId: string,
    userFirstName: string,
    userHandle: string,
    ajoCode: string
): Promise<boolean> => {
    for (let i = 0; i < array.length; i++) {
        const userData = await findUserByHandle(array[i].handle)
        if (userData) {
            await createNotification(type.AJO, userHandle, userData.handle, userFirstName, ajoId, ajoCode, 0)
        }
    }
    return true
}

const findUserByHandle = async (searchValue: string): Promise<IUser> => {
    const data = await User.findOne({ handle: searchValue }).select("-password")
    return data
}

const findAllByHandle = async (
    ModelType: string,
    searchValue: string
): Promise<Array<INotification | IConnection | ITransaction | undefined>> => {
    let data
    if (ModelType === "Notification") {
        data = await Notification.find({ sender: searchValue }).limit(20)
        return data
    } else if (ModelType === "Transaction") {
        data = await Transaction.find({ initiatorHandle: searchValue }).limit(20)
        return data
    } else if (ModelType === "Connection") {
        data = await Connection.find({ connectorHandle: searchValue })
        return data
    } else {
        return []
    }
}

const addNewMember = async (
    array: Array<{ handle: string }>,
    ajo_code: string,
    userHandle: string,
    userFirstName: string
): Promise<Array<IAjoMember> | string> => {
    const res: Result = {}
    const addedMembers = []
    for (let i = 0; i < array.length; i++) {
        const userData = await findUserByHandle(array[i].handle)
        if (userData) {
            const ajoData = await Ajo.findOne({ ajo_code })
            const isExist = ajoData.members.find((member: IAjoMember) => member.handle === array[i].handle)
            if (isExist) {
                return (res.error = `User with ${array[i].handle} is already added`)
            } else {
                addedMembers.push({
                    name: `${userData.firstName} ${userData.lastName}`,
                    phone: userData.phone,
                    handle: userData.handle,
                    bank: userData.bank || null,
                    bankCode: userData.bankCode || null,
                    accountNumber: userData.accountNumber || null,
                    total_debit: 0,
                    total_credit: 0,
                    ajo_code: "",
                    active: false
                })
                await createNotification(type.AJO, userHandle, userData.handle, userFirstName, ajoData.id, ajo_code, 0)
            }
        } else {
            return `User with ${array[i].handle} does not exist`
        }
    }
    return addedMembers
}

const createNotification = async (
    sender: string,
    receiver: string,
    senderFirstName: string,
    id: string,
    code: string,
    notificationType: string,
    amount: number
): Promise<void> => {
    const notify = new Notification({
        sender,
        receiver,
        read: false,
        type: notificationType,
        typeId: id,
        message:
            notificationType === type.TRANSFER
                ? `${senderFirstName} - @${sender} just transferred ${formatter.format(
                      validateAmount(amount.toString())
                  )} to your attached account.`
                : notificationType === type.AJO && sender === receiver
                ? `You created AJo account!! Your Ajo Code is - ${code}.`
                : notificationType === type.AJO && sender !== receiver
                ? `${senderFirstName} created Ajo account and added you.`
                : notificationType === type.REQUEST_FUND
                ? `@${senderFirstName} - @${sender} has requested the sum of ${formatter.format(
                      validateAmount(amount.toString())
                  )} from you. "${code}"`
                : ""
    })
    await notify.save()
}

export { addMember, ajoCode, notifyMembers, findUserByHandle, findAllByHandle, addNewMember, createNotification }
