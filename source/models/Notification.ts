import mongoose from "mongoose"
import { INotification } from "./index"

const Schema = mongoose.Schema

const notificationSchema = new Schema(
    {
        senderId: {
            type: String
        },
        receiverId: {
            type: String
        },
        message: {
            type: String
        },
        read: {
            type: Boolean
        },
        type: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

const Notification = mongoose.model<INotification>("Notification", notificationSchema)

export { Notification }
