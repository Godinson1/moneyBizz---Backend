import mongoose from "mongoose"
import { IConnection } from "./index"

const Schema = mongoose.Schema

const connectionSchema = new Schema(
    {
        connectorHandle: {
            type: String
        },
        connectorID: {
            type: String
        },
        connecteeHandle: {
            type: String
        },
        connectee_accountNumber: {
            type: Number
        },
        connectee_bank: {
            type: String
        },
        connectee_profilePhoto: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

const Connection = mongoose.model<IConnection>("Connection", connectionSchema)

export { Connection }
