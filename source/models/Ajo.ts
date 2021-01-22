import mongoose from "mongoose"
import { IAjo } from "./index"

const Schema = mongoose.Schema

const ajoSchema = new Schema(
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
        initiator_bankCode: {
            type: String
        },
        initiator_accountNumber: {
            type: String
        },
        target_amount: {
            type: String
        },
        total_balance: {
            type: String
        },
        total_credit: {
            type: String
        },
        total_debit: {
            type: String
        },
        reason: {
            type: String
        },
        status: {
            type: String
        },
        ajo_code: {
            type: String
        },
        terminatedAt: {
            type: Date
        },
        members: {
            type: Array
        }
    },
    {
        timestamps: true
    }
)

const Ajo = mongoose.model<IAjo>("Ajo", ajoSchema)

export { Ajo }
