import { IUser, Notification } from "../../../models"
import { IAjoMember } from "../../../models/interface"
import mongoose from "mongoose"

const addMember = async (
    User: mongoose.Model<IUser>,
    array: Array<{ handle: string }>,
    userId: string,
    userFirstName: string
): Promise<Array<IAjoMember>> => {
    const addedMembers = []
    for (let i = 0; i < array.length; i++) {
        const userData = await User.findOne({ handle: array[i].handle })
        if (userData) {
            addedMembers.push({
                name: `${userData.firstName} ${userData.lastName}`,
                phone: userData.phone,
                bank: userData.bank || null,
                bankCode: userData.bankCode || null,
                accountNumber: userData.accountNumber || null,
                total_debit: 0,
                total_credit: 0,
                ajo_code: "",
                active: false
            })
            const notify = new Notification({
                senderId: userId,
                receiverId: userData._id,
                read: false,
                type: "Ajo",
                message: `${userFirstName} created Ajo account and added you.`
            })
            await notify.save()
        }
    }
    return addedMembers
}

const ajoCode = (): string => {
    return `ajo_${Math.floor(100000 + Math.random() * 900000)}`
}

export { addMember, ajoCode }
