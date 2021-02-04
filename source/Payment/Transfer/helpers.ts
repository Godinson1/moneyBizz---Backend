import { findUserByHandle } from "../Savings"
import { bizzMember, RecipientsData, ResData } from "./index"

const bizzRecipients = async (array: Array<{ handle: string }>): Promise<Array<bizzMember> | string> => {
    const addedMembers = []
    for (let i = 0; i < array.length; i++) {
        const userData = await findUserByHandle(array[i].handle)
        if (userData) {
            addedMembers.push({
                type: "nuban",
                name: `${userData.firstName} ${userData.lastName}`,
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

export { bizzRecipients, createBizzersData }
