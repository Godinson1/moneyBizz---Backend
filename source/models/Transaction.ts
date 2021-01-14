import mongoose from "mongoose"
import { ITransaction } from "./index"

const Schema = mongoose.Schema

const transactionSchema = new Schema(
    {
        initiator: {
            type: String
        },
        initiator_phone: {
            type: String
        },
        initiator_bank: {
            type: String
        },
        initiator_accountNumber: {
            type: Number
        },
        recipient_bank: {
            type: String
        },
        recipient_accountNumber: {
            type: Number
        },
        recipient: {
            type: String
        },
        amount: {
            type: Number
        },
        reason: {
            type: String
        },
        status: {
            type: String
        },
        executedAt: {
            type: Number
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
