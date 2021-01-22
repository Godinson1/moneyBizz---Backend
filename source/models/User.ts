import mongoose from "mongoose"
import { IUser } from "./interface"

const Schema = mongoose.Schema

const UserSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        dateOfBirth: {
            type: String
        },
        handle: {
            type: String
        },
        email: {
            type: String,
            required: true
        },
        mbCode: {
            type: String
        },
        address: {
            type: String
        },
        phone: {
            type: String,
            unique: true,
            required: true
        },
        sex: {
            type: String
        },
        profile_photo: {
            type: String
        },
        password: {
            type: String
        },
        bvn: {
            type: Number
        },
        nameOfNextOfKin: {
            type: String
        },
        phoneOfNextOfKin: {
            type: String
        },
        ref: {
            type: String
        },
        total_credit: {
            type: Number
        },
        total_balance: {
            type: Number
        },
        available_balance: {
            type: Number
        },
        total_debit: {
            type: Number
        },
        transactions: {
            type: Array
        },
        connections: {
            type: Array
        },
        active: {
            type: Boolean
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model<IUser>("User", UserSchema)

export { User }
