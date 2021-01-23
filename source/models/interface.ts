import mongoose from "mongoose"

export interface IUser extends mongoose.Document {
    userID: mongoose.Types.ObjectId
    firstName: string
    lastName: string
    dateOfBirth: string
    phone: string
    handle: string
    email: string
    address: string
    sex: string
    mbCode: string
    active: boolean
    bank: string
    bankCode: string
    accountNumber: string
    profile_photo: string
    ref: string
    password: string
    total_balance: number
    available_balance: number
    nameOfNextOfKin: string
    phoneOfNextOfKin: string
    connections: Array<IConnection>
    total_debit: number
    total_credit: number
    transactions: Array<ITransaction>
}

export interface ITransaction extends mongoose.Document {
    transactionID: mongoose.Types.ObjectId
    initiator: string
    initiator_phone: string
    initiator_bank: string
    initiator_bankCode: string
    initiator_accountNumber: string
    recipient: string
    recipient_bank: string
    recipient_accountNumber: string
    reason: string
    amount: string
    ref: string
    executedAt: Date
    createdAt: Date
    executed: boolean
    status: string
}

export interface IConnection extends mongoose.Document {
    connectionID: mongoose.Types.ObjectId
    connectorID: string
    connectorName: string
    connectee_accountNumber: number
    connectee_bank: string
    connectee_profilePhoto: string
    connecteeName: string
}

export interface IAjo extends mongoose.Document {
    ajoID: mongoose.Types.ObjectId
    createdBy: string
    reason: string
    target_amount: string
    total_balance: string
    total_credit: string
    total_debit: string
    ajo_code: string
    terminatedAt: Date
    members: Array<IAjoMember>
    status: string
}

export interface IAjoMember {
    name: string
    phone: string
    handle: string
    bank: string | null
    bankCode: string | null
    accountNumber: string | null
    total_debit: number
    total_credit: number
    ajo_code: string
    active: boolean
}

export interface INotification extends mongoose.Document {
    notificationID: mongoose.Types.ObjectId
    sender: string
    receiver: string
    read: boolean
    message: string
    type: string
}
