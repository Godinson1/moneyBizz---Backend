import mongoose from "mongoose"
import { IAjo } from "./index"

const Schema = mongoose.Schema

const ajoSchema = new Schema(
    {
        createdBy: {
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
