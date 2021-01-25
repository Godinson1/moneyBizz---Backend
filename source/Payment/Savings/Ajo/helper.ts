import { IUser, IAjoMember, Notification, User, Ajo } from "../../../models"
import { Result } from "./interface"

const addMember = async (array: Array<{ handle: string }>): Promise<Array<IAjoMember>> => {
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
                active: false
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
            await createNotification(userHandle, userData.handle, userFirstName, ajoId, ajoCode)
        }
    }
    return true
}

const findUserByHandle = async (searchValue: string): Promise<IUser> => {
    const data = await User.findOne({ handle: searchValue })
    return data
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
                await createNotification(userHandle, userData.handle, userFirstName, ajoData.id, ajo_code)
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
    ajoID: string,
    ajoCode: string
): Promise<void> => {
    const notify = new Notification({
        sender,
        receiver,
        read: false,
        type: "Ajo",
        typeId: ajoID,
        message:
            sender === receiver
                ? `You created AJo account!! Your Ajo Code is - ${ajoCode}.`
                : `${senderFirstName} created Ajo account and added you.`
    })
    await notify.save()
}

export { addMember, ajoCode, notifyMembers, findUserByHandle, addNewMember }
