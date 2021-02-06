import jwt from "jsonwebtoken"
import { IUser } from "../models"
import nodemailer from "nodemailer"
import { type, GMAIL } from "../Utility"
import {
    welcomeBody,
    welcomeHeader,
    fundWalletBody,
    fundWalletHeader,
    debitWalletHeader,
    debitWalletBody
} from "./index"
import { resetPasswordBody, resetPasswordHeader } from "./data"
import client from "twilio"

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
        service: GMAIL,
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
        service: GMAIL,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    })

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject:
            emailType === type.FUND
                ? fundWalletHeader(firstName, amount, reference)
                : debitWalletHeader(firstName, amount, reference),
        html:
            emailType === type.FUND
                ? fundWalletBody(firstName, amount, reference, date, reason)
                : debitWalletBody(firstName, amount, reference, date, reason)
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error)
        } else {
            console.log("Email sent: " + info.response)
        }
    })
}

const sendMobileOTP = async (data: number, phone: string): Promise<void> => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    const twilioClient = client(accountSid, authToken)

    twilioClient.messages
        .create({
            body: `Your bizz code is - ${data}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
        })
        .then((message) => console.log(message.sid))
        .catch((error) => console.log(error))
}

export { jwtSignUser, sendAuthMail, uniqueCode, sendMobileOTP, bizzCode, sendTransactionMail }
