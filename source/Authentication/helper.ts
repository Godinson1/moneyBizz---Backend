import jwt from "jsonwebtoken"
import { IUser } from "../models"
import nodemailer from "nodemailer"
import { type } from "../Utility"
import { welcomeBody, welcomeHeader, fundWalletBody, fundWalletHeader } from "./index"
import { resetPasswordBody, resetPasswordHeader } from "./data"

const jwtSignUser = (user: IUser): string => {
    const ONE_WEEK = 60 * 60 * 24 * 7
    const { id, firstName, email, handle, lastName, phone } = user
    const userData = { id, firstName, email, handle, lastName, phone }
    return jwt.sign(userData, `${process.env.jwt_secret}`, {
        expiresIn: ONE_WEEK
    })
}

const bizzCode = (): string => {
    return `MB${Math.floor(100000 + Math.random() * 900000)}`
}

const uniqueCode = (): number => {
    return Math.floor(100000 + Math.random() * 900000)
}

const sendAuthMail = (emailType: string, code: string, email: string, firstName: string): void => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    })

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: emailType === type.WELCOME ? welcomeHeader() : resetPasswordHeader(),
        html: emailType === type.WELCOME ? welcomeBody(code, firstName) : resetPasswordBody(code, firstName)
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error)
        } else {
            console.log("Email sent: " + info.response)
        }
    })
}

const sendTransactionMail = (
    emailType: string,
    email: string,
    firstName: string,
    amount: string,
    reference: string,
    reason: string,
    date: string
): void => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    })

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: emailType === type.FUND ? fundWalletHeader(firstName, amount, reference) : "In Progress",
        html: emailType === type.FUND ? fundWalletBody(firstName, amount, reference, date, reason) : "In Progress"
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error)
        } else {
            console.log("Email sent: " + info.response)
        }
    })
}

const sendMobileOTP = (data: number): string => {
    return `${data}`
}

export { jwtSignUser, sendAuthMail, uniqueCode, sendMobileOTP, bizzCode, sendTransactionMail }
