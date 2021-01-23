import jwt from "jsonwebtoken"
import { IUser } from "../models"
import nodemailer from "nodemailer"

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

const sendWelcomeMailWithCode = (id: string, email: string, firstName: string): void => {
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
        subject: `Welcome to MoneyBizz `,
        html: `<h2>&#9995; Hi ${firstName}</h2> 
               <p>Thank you for choosing to join the FORCE as a MoneyBizzer.<br>
               <br>
               Your unique code is <b>${id}</b>
               <br> Thank you once again!</p> 
               <br><br>
               <b>All the best!</b>
               <br>
               <b>Team MoneyBizz<b>`
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error)
        } else {
            console.log("Email sent: " + info.response)
        }
    })
}

export { jwtSignUser, sendWelcomeMailWithCode, bizzCode }
