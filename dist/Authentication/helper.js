"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTransactionMail = exports.bizzCode = exports.sendMobileOTP = exports.uniqueCode = exports.sendAuthMail = exports.jwtSignUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const Utility_1 = require("../Utility");
const index_1 = require("./index");
const data_1 = require("./data");
const twilio_1 = __importDefault(require("twilio"));
const jwtSignUser = (user) => {
    const ONE_WEEK = 60 * 60 * 24 * 7;
    const { id, firstName, email, handle, lastName, phone } = user;
    const userData = { id, firstName, email, handle, lastName, phone };
    return jsonwebtoken_1.default.sign(userData, `${process.env.jwt_secret}`, {
        expiresIn: ONE_WEEK
    });
};
exports.jwtSignUser = jwtSignUser;
const bizzCode = () => {
    return `MB${Math.floor(100000 + Math.random() * 900000)}`;
};
exports.bizzCode = bizzCode;
const uniqueCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
};
exports.uniqueCode = uniqueCode;
const sendAuthMail = (emailType, code, email, firstName) => {
    const transporter = nodemailer_1.default.createTransport({
        service: Utility_1.GMAIL,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: emailType === Utility_1.type.WELCOME ? (0, index_1.welcomeHeader)() : (0, data_1.resetPasswordHeader)(),
        html: emailType === Utility_1.type.WELCOME ? (0, index_1.welcomeBody)(code, firstName) : (0, data_1.resetPasswordBody)(code, firstName)
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
        else {
            console.log("Email sent: " + info.response);
        }
    });
};
exports.sendAuthMail = sendAuthMail;
const sendTransactionMail = (emailType, email, firstName, amount, reference, reason, date) => {
    const transporter = nodemailer_1.default.createTransport({
        service: Utility_1.GMAIL,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: emailType === Utility_1.type.FUND
            ? (0, index_1.fundWalletHeader)(firstName, amount, reference)
            : (0, index_1.debitWalletHeader)(firstName, amount, reference),
        html: emailType === Utility_1.type.FUND
            ? (0, index_1.fundWalletBody)(firstName, amount, reference, date, reason)
            : (0, index_1.debitWalletBody)(firstName, amount, reference, date, reason)
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
        else {
            console.log("Email sent: " + info.response);
        }
    });
};
exports.sendTransactionMail = sendTransactionMail;
const sendMobileOTP = (data, phone) => __awaiter(void 0, void 0, void 0, function* () {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioClient = (0, twilio_1.default)(accountSid, authToken);
    twilioClient.messages
        .create({
        body: `Your bizz code is - ${data}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
    })
        .then((message) => console.log(message.sid))
        .catch((error) => console.log(error));
});
exports.sendMobileOTP = sendMobileOTP;
