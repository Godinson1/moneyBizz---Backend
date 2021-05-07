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
            type: String,
            unique: true,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        mbCode: {
            type: String
        },
        phoneTwo: {
            type: String
        },
        address: {
            type: String
        },
        lgaOfAddress: {
            type: String
        },
        stateOfOrigin: {
            type: String
        },
        lgaStateOfOrigin: {
            type: String
        },
        phone: {
            type: String
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
            type: String
        },
        authorization: {
            type: Array
        },
        autoSave: {
            type: Object
        },
        accountNumber: {
            type: String
        },
        bank: {
            type: String
        },
        bankCode: {
            type: String
        },
        bvnOtp: {
            type: Number
        },
        bvnBlacklisted: {
            type: Boolean
        },
        bvnConfirmed: {
            type: Boolean
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
