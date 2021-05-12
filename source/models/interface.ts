import mongoose from "mongoose"
import { DetectResult } from "node-device-detector"

export interface IUser extends mongoose.Document {
    userID: mongoose.Types.ObjectId
    firstName: string
    lastName: string
    dateOfBirth: string
    phone: string
    handle: string
    email: string
    address: string
    lgaOfAddress: string
    phoneTwo: string
    sex: string
    stateOfOrigin: string
    lgaStateOfOrigin: string
    mbCode: string
    active: boolean
    authorization: Array<IAuthorization>
    autoSave: IAutosave
    bvn: string
    bvnOtp: number
    bvnConfirmed: boolean
    bvnBlacklisted: boolean
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
    total_debit: number
    total_credit: number
}

export interface ITransaction extends mongoose.Document {
    transactionID: mongoose.Types.ObjectId
    initiatorHandle: string
    initiator_phone: string
    initiator_bank: string
    initiator_bankCode: string
    initiator_accountNumber: string
    recipient: string
    recipient_bank: string
    recipient_accountNumber: string
    deviceIp: string
    deviceInfo: {
        device: DetectResult
        userAgent: string
    }
    reason: string
    amount: string
    ref: string
    executedAt: Date
    createdAt: Date
    executed: boolean
    status: string
    type: string
}

export interface IConnection extends mongoose.Document {
    connectionID: mongoose.Types.ObjectId
    connectorID: string
    connectorHandle: string
    connectee_accountNumber: number
    connectee_bank: string
    connectee_profilePhoto: string
    connecteeHandle: string
}

export interface ITransfer extends mongoose.Document {
    transferID: mongoose.Types.ObjectId
    initiatorID: string
    initiatorHandle: string
    transferCode: string
    recipient_accountNumber: number
    recipient_bank: string
    executed: boolean
    recipientHandle: string
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

export interface IAuthorization {
    authorization_code: string
    bin: string
    last4: string
    exp_month: string
    exp_year: string
    channel: string
    card_type: string
    bank: string
    country_code: string
    brand: string
    signature: string
    receiver_bank_account_number: string | number
    receiver_bank: string | null
    reusable: ConstrainBoolean
    account_name: string
}

export interface IAutosave {
    interval: string
    minute: number
    hour: number
    dayOfMonth: number
    dayOfWeek: number
    amount: string
    active: boolean
}
