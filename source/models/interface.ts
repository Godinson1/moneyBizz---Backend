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
    profile_photo: string
    password: string
    total_balance: number
    available_balance: number
    nameOfNextOfKin: string
    phoneOfNextOfKin: string
    connections: Array<IConnection>
    total_debits: number
    transactions: Array<ITransaction>
}

export interface ITransaction extends mongoose.Document {
    transactionID: mongoose.Types.ObjectId
    initiator: string
    initiator_phone: string
    initiator_bank: string
    initiator_accountNumber: number
    recipient: string
    recipient_bank: string
    recipient_accountNumber: number
    reason: string
    amount: number
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
