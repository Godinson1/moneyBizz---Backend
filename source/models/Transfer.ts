import mongoose from "mongoose"
import { ITransfer } from "./index"

const Schema = mongoose.Schema

const transferSchema = new Schema(
    {
        initiatorHandle: {
            type: String
        },
        initiatorID: {
            type: String
        },
        recipientHandle: {
            type: String
        },
        recipient_accountNumber: {
            type: Number
        },
        recipient_bank: {
            type: String
        },
        executed: {
            type: Boolean
        },
        transferCode: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

const Transfer = mongoose.model<ITransfer>("Transfer", transferSchema)

export { Transfer }
