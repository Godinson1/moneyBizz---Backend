import mongoose from "mongoose"
import { ITransaction } from "./index"

const Schema = mongoose.Schema

const transactionSchema = new Schema(
    {
        initiatorHandle: {
            type: String
        },
        initiator_phone: {
            type: String
        },
        initiator_bank: {
            type: String
        },
        initiator_bankCode: {
            type: String
        },
        initiator_accountNumber: {
            type: String
        },
        recipient_bank: {
            type: String
        },
        recipient_accountNumber: {
            type: String
        },
        recipient: {
            type: String
        },
        amount: {
            type: String
        },
        reason: {
            type: String
        },
        status: {
            type: String
        },
        deviceIp: {
            type: String
        },
        deviceInfo: {
            type: Object
        },
        ref: {
            type: String
        },
        type: {
            type: String
        },
        executedAt: {
            type: Date
        },
        executed: {
            type: Boolean
        }
    },
    {
        timestamps: true
    }
)

const Transaction = mongoose.model<ITransaction>("Transaction", transactionSchema)

export { Transaction }
