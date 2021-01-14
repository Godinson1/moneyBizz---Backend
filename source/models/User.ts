import mongoose from "mongoose"
import { IUser } from "./interface"

const Schema = mongoose.Schema

const UserSchema = new Schema(
    {
        fname: {
            type: String,
            required: true
        },
        lname: {
            type: String,
            required: true
        },
        dateOfBirth: {
            type: String
        },
        email: {
            type: String,
            required: true
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
        bvn: {
            type: Number
        },
        nameOfNextOfKin: {
            type: String,
            required: true
        },
        phoneOfNextOfKin: {
            type: String,
            required: true
        },
        total_credit: {
            type: String
        },
        total_balance: {
            type: Number
        },
        available_balance: {
            type: Number
        },
        total_debits: {
            type: Number
        },
        transactions: {
            type: Array
        },
        connections: {
            type: Array
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model<IUser>("User", UserSchema)

export { User }
