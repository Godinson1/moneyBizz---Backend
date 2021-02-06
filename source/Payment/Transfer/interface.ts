interface bizzMember {
    type: string
    name: string
    account_number: string
    bank_code: string
    currency: string
}

interface RecipientsData {
    domain: string
    name: string
    type: string
    description: string
    integration: number
    currency: string
    metadata: null
    details: {
        account_number: string
        account_name: null
        bank_code: string
        bank_name: string
    }
    recipient_code: string
    active: true
    id: number
    isDeleted: boolean
    createdAt: string
    updatedAt: string
}

interface ResData {
    amount: number
    recipient: string
    reason: string
}

interface TransferRes {
    recipient: string
    amount: number
    transfer_code: string
    currency: string
}

export { bizzMember, RecipientsData, ResData, TransferRes }
