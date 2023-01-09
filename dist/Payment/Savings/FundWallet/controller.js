"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.fundAccountWithCard = exports.fundAccountWithExistingCard = exports.autoFundAccount = exports.debitAccount = exports.fundAccountWithBankAccount = void 0;
const http_status_codes_1 = require("http-status-codes");
const models_1 = require("../../../models");
const index_1 = require("../../index");
const Utility_1 = require("../../../Utility");
const validations_1 = require("../../../validations");
const Savings_1 = require("../../Savings");
const index_2 = require("../index");
const schedule = __importStar(require("node-schedule"));
const { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST, NOT_FOUND } = http_status_codes_1.StatusCodes;
/**
 * Route for funding user wallet with bank account (Personal Saving)
 * Request - POST
 * Validate request and attempt transaction
 */
const fundAccountWithBankAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData;
    const { amount, code, account_number } = req.body;
    if ((0, validations_1.isEmpty)(amount) || (0, validations_1.isEmpty)(code) || (0, validations_1.isEmpty)(account_number))
        return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "Please provide all required fields");
    const data = JSON.stringify({
        email: req.user.email,
        amount,
        bank: {
            code,
            account_number,
            phone: "+2348100000000",
            token: "123456"
        },
        birthday: "1995-12-23"
    });
    try {
        try {
            userData = yield models_1.User.findOne({ _id: req.user.id });
            if (!userData)
                return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, "You can't carry out this operation..");
            const chargeResponse = yield (0, index_1.makeRequest)(index_1.CHARGE_URL, data);
            if (chargeResponse) {
                yield (0, index_2.createTransaction)(userData, req, amount, chargeResponse.data.data.reference, Utility_1.type.FUND);
            }
            return res.status(OK).json({
                status: Utility_1.success,
                message: "Payment attempted successfully",
                data: chargeResponse.data
            });
        }
        catch (err) {
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, err.response.data.message);
        }
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.fundAccountWithBankAccount = fundAccountWithBankAccount;
/**
 * Route for funding user wallet with card (Personal Saving)
 * Request - POST
 * Validate request and attempt transaction
 */
const fundAccountWithCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData;
    const { amount } = req.body;
    if ((0, validations_1.isEmpty)(amount))
        return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "Amount must not be empty..");
    const data = JSON.stringify({
        email: req.user.email,
        amount
    });
    try {
        try {
            userData = yield models_1.User.findOne({ _id: req.user.id });
            if (!userData)
                return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, "You can't carry out this operation..");
            const chargeResponse = yield (0, index_1.makeRequest)(index_1.INITIALIZE_TRANSACTION, data);
            if (chargeResponse) {
                yield (0, index_2.createTransaction)(userData, req, amount, chargeResponse.data.data.reference, Utility_1.type.FUND);
            }
            return res.status(OK).json({
                status: Utility_1.success,
                message: "Payment attempted successfully",
                data: chargeResponse.data
            });
        }
        catch (err) {
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, err.response.data.message);
        }
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.fundAccountWithCard = fundAccountWithCard;
/**
 * Route for funding user wallet with existing card (Personal Saving)
 * Request - POST
 * Validate request and attempt transaction
 */
const fundAccountWithExistingCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData;
    const { amount } = req.body;
    if ((0, validations_1.isEmpty)(amount))
        return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "Amount must not be empty..");
    try {
        try {
            userData = yield models_1.User.findOne({ _id: req.user.id });
            if (!userData)
                return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, "You can't carry out this operation..");
            if (userData.authorization && Object.keys(userData.authorization).length !== 0) {
                const params = JSON.stringify({
                    email: req.user.email,
                    amount,
                    authorization_code: userData.authorization[0].authorization_code
                });
                const chargeResponse = yield (0, index_1.makeRequest)(index_1.CHARGE_AUTHORIZATION, params);
                if (chargeResponse.data.status) {
                    yield (0, index_2.createTransaction)(userData, req, amount, chargeResponse.data.data.reference, Utility_1.type.FUND);
                    return res.status(OK).json({
                        status: Utility_1.success,
                        message: "Payment attempted successfully",
                        data: chargeResponse.data
                    });
                }
            }
            else {
                return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, "Authorization not found. Kindly initiate a transaction to get one.");
            }
        }
        catch (err) {
            console.log(err);
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, err.response.data.message);
        }
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.fundAccountWithExistingCard = fundAccountWithExistingCard;
/**
 * @Description - Route for debiting user wallet (Personal Saving)
 * Request - POST
 * Validate request and debit user account
 */
const debitAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData;
    const { amount, code, account_number } = req.body;
    //Check for empty field
    if ((0, validations_1.isEmpty)(amount.toString()) || (0, validations_1.isEmpty)(code) || (0, validations_1.isEmpty)(account_number))
        return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "Please provide all required fields");
    try {
        //Check for valid authenticated user
        userData = yield models_1.User.findOne({ _id: req.user.id });
        if (!userData)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, "You can't carry out this operation..");
        //Check for sufficient balance
        if (amount > userData.available_balance)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "Insufficient Fund: Kindly top up your bizz wallet to carry out this transaction");
        //Create recipient params
        const recipientParams = JSON.stringify({
            type: "nuban",
            name: `${req.user.firstName} ${req.user.lastName}`,
            account_number,
            bank_code: code,
            currency: "NGN"
        });
        try {
            const recipient = yield (0, Savings_1.createRecipient)(index_1.CREATE_RECIPIENT, recipientParams);
            //Check if recipient status is true
            if (recipient.status) {
                //Create transfer params
                const transferParams = JSON.stringify({
                    source: Utility_1.source,
                    amount,
                    recipient: recipient.data.recipient_code,
                    reason: "Personal Debit - Bizz Wallet"
                });
                const transferRes = yield (0, Savings_1.transferFund)(index_1.TRANSFER, transferParams);
                //Initiate transaction
                if (transferRes.status) {
                    yield (0, index_2.createTransaction)(userData, req, amount.toString(), transferRes.data.transfer_code, Utility_1.type.TRANSFER, transferRes.data.reason);
                }
                return (0, Utility_1.handleResponse)(res, Utility_1.success, OK, "Bizz wallet debited successfully");
            }
        }
        catch (err) {
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, err.response.data.message);
        }
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.debitAccount = debitAccount;
/**
 * @Description - Route for debiting user wallet (Personal Saving)
 * Request - POST
 * Validate request and debit user account
 */
const autoFundAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData;
    console.log("reading cron-start");
    try {
        try {
            userData = yield models_1.User.findOne({ _id: req.user.id });
            if (!userData)
                return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, "You can't carry out this operation..");
            if (userData.authorization && userData.authorization.length !== 0) {
                if (Object.keys(userData.autoSave).length === 0)
                    return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, "Please update your auto save setting.");
                const { interval, minute, hour, dayOfMonth, dayOfWeek, amount } = userData.autoSave;
                console.log({ interval, minute, hour, dayOfMonth, dayOfWeek, amount });
                schedule.scheduleJob(req.user.email, (0, index_2.getInterval)(interval, minute, hour, dayOfMonth, dayOfWeek), () => __awaiter(void 0, void 0, void 0, function* () {
                    console.log(`@${req.user.handle} auto-credited ₦${amount} successfully.`);
                    const chargeResponse = yield (0, Savings_1.chargeUser)(userData, req, amount);
                    if (typeof chargeResponse === "string")
                        return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, chargeResponse);
                }));
                return res.status(OK).json({
                    status: Utility_1.success,
                    message: "Autosave activated successfully."
                });
            }
            else {
                return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, "Authorization not found. Kindly initiate a transaction to get one.");
            }
        }
        catch (err) {
            console.log(err);
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, err.response.data.message);
        }
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.autoFundAccount = autoFundAccount;
