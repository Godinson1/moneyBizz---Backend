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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBalance = exports.webhook = exports.confirmOtp = void 0;
const http_status_codes_1 = require("http-status-codes");
const models_1 = require("../models");
const index_1 = require("./index");
const Utility_1 = require("../Utility");
const Authentication_1 = require("../Authentication");
const Savings_1 = require("./Savings");
const { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } = http_status_codes_1.StatusCodes;
const confirmOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let transactionData;
    const { otp } = req.body;
    try {
        try {
            const userData = yield models_1.User.findOne({ _id: req.user.id });
            transactionData = yield models_1.Transaction.findOne({ ref: userData === null || userData === void 0 ? void 0 : userData.ref });
            if (!userData)
                return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "You can't carry out this operation..");
            const data = JSON.stringify({
                otp,
                reference: userData.ref
            });
            const otpResponse = yield (0, index_1.makeRequest)(index_1.OTP_URL, data);
            if (otpResponse && transactionData !== null) {
                const otpRes = yield (0, index_1.makeRequest)(index_1.OTP_URL, data);
                transactionData.executedAt = otpRes.data.data.transaction_date;
                transactionData.initiator_bank = otpRes.data.data.authorization.bank;
                transactionData.executed = true;
                const trans = yield transactionData.save();
                return res.status(OK).json({
                    status: Utility_1.success,
                    message: "Payment attempted successfully",
                    data: trans
                });
            }
            else {
                return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
            }
        }
        catch (err) {
            console.log(err);
            return res.status(BAD_REQUEST).json({
                status: Utility_1.error,
                message: (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data
            });
        }
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.confirmOtp = confirmOtp;
const webhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData;
    let transactionData;
    let transferData;
    try {
        //@ - Todo
        //Whitelist only requests from paystack - Headers
        //Create utility functions for different transaction types
        //--------------------------------------------------------
        //--------------------------------------------------------
        //const isValidIP = checkIp(req.body.data.ip_address)
        res.status(OK);
        //if (!isValidIP) {
        const chargeResponse = req.body;
        userData = yield models_1.User.findOne({ email: chargeResponse.data.customer.email });
        if (chargeResponse.data.channel === "card") {
            yield (0, Savings_1.createTransaction)(userData, req, chargeResponse.data.amount.toString(), chargeResponse.data.reference, Utility_1.type.FUND);
            if ((userData === null || userData === void 0 ? void 0 : userData.authorization.length) === 0) {
                userData === null || userData === void 0 ? void 0 : userData.authorization.push(chargeResponse.data.authorization);
            }
        }
        transactionData = yield models_1.Transaction.findOne({ ref: userData === null || userData === void 0 ? void 0 : userData.ref });
        if (chargeResponse.data.channel === "card" && transactionData !== null) {
            transactionData.executedAt = chargeResponse.data.transaction_date;
            transactionData.initiator_bank = chargeResponse.data.authorization.bank;
            transactionData.executed = true;
            yield transactionData.save();
        }
        transferData = yield models_1.Transfer.findOne({ transferCode: chargeResponse.data.transfer_code });
        const amount = (0, index_1.validateAmount)(chargeResponse.data.amount.toString());
        if (chargeResponse.event === "charge.success" &&
            userData !== null &&
            transactionData !== null &&
            transactionData.status !== Utility_1.APPROVED) {
            userData.total_credit += amount;
            const balance = userData.total_credit - userData.total_debit;
            userData.total_balance = balance;
            userData.available_balance = balance;
            transactionData.status = chargeResponse.data.gateway_response;
            yield userData.save();
            yield transactionData.save();
            yield (0, Authentication_1.sendTransactionMail)(Utility_1.type.FUND, userData.email, userData.firstName, chargeResponse.data.amount.toString(), chargeResponse.data.reference, transactionData === null || transactionData === void 0 ? void 0 : transactionData.reason, chargeResponse.data.paid_at);
        }
        if (chargeResponse.event === "transfer.success" && userData !== null) {
            userData.total_debit += amount;
            const balance = userData.total_credit - userData.total_debit;
            userData.total_balance = balance;
            userData.available_balance = balance;
            yield userData.save();
            yield (0, Authentication_1.sendTransactionMail)(Utility_1.type.DEBIT, userData.email, userData.firstName, chargeResponse.data.amount.toString(), chargeResponse.data.transfer_code, transactionData === null || transactionData === void 0 ? void 0 : transactionData.reason, chargeResponse.data.created_at);
            yield (0, Savings_1.createNotification)(Utility_1.type.TRANSFER, userData.handle, transferData === null || transferData === void 0 ? void 0 : transferData.recipientHandle, userData.firstName, transferData === null || transferData === void 0 ? void 0 : transferData.id, chargeResponse.data.reference, amount);
        }
        if (chargeResponse.event === "charge.failure" && transactionData !== null) {
            transactionData.status = "Failed";
            transactionData.executed = false;
            yield transactionData.save();
        }
        //} else {
        //console.log("Not from paystack")
        //}
        return res.status(OK);
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.webhook = webhook;
const checkBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const balanceRes = yield (0, index_1.makeGetRequest)(index_1.BALANCE);
        return res.status(OK).json({
            status: Utility_1.success,
            data: balanceRes.data
        });
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.checkBalance = checkBalance;
