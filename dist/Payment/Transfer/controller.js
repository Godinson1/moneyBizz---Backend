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
exports.bulkTransfer = exports.singleTransfer = void 0;
const http_status_codes_1 = require("http-status-codes");
const models_1 = require("../../models");
const index_1 = require("../index");
const Utility_1 = require("../../Utility");
const validations_1 = require("../../validations");
const Savings_1 = require("../Savings");
const index_2 = require("./index");
const { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST, NOT_FOUND } = http_status_codes_1.StatusCodes;
/**
 * Name - singleTransfer - FUND BIZZER
 * @Description - Route for crediting bizzer account
 * Request - POST
 * Accepts users handle, validate and send fund to attached bank account
 */
const singleTransfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData;
    const { amount, handle, reason } = req.body;
    //Check for empty field
    if ((0, validations_1.isEmpty)(amount.toString()) || (0, validations_1.isEmpty)(handle))
        return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "Please provide all required fields");
    try {
        //Check for valid authenticated user
        userData = yield models_1.User.findOne({ _id: req.user.id });
        if (!userData)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "You can't carry out this operation..");
        //Check for existing bizzer handle
        const bizzerData = yield (0, Savings_1.findUserByHandle)(handle);
        if (!bizzerData)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, `Bizzer with @${handle} not found`);
        //Check for sufficient balance
        if (amount > userData.available_balance)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "Insufficient Fund: Kindly top up your bizz wallet to carry out this transaction");
        //Create recipient params
        const recipientParams = JSON.stringify({
            type: "nuban",
            name: `${bizzerData.firstName} ${bizzerData.lastName}`,
            account_number: bizzerData.accountNumber,
            bank_code: bizzerData.bankCode,
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
                    reason
                });
                const transferRes = yield (0, Savings_1.transferFund)(index_1.TRANSFER, transferParams);
                //Initiate transaction
                if (transferRes.status) {
                    yield (0, Savings_1.createTransaction)(userData, req, amount, transferRes.data.transfer_code, Utility_1.type.TRANSFER, reason);
                    yield (0, index_2.createTransfer)(userData, bizzerData, transferRes.data.transfer_code);
                    return (0, Utility_1.handleResponse)(res, Utility_1.success, OK, `You successfully sent money to ${bizzerData.handle}`);
                }
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
exports.singleTransfer = singleTransfer;
/**
 * Name - bulkTransfer - GIVE AWAY!
 * @Description - Route for crediting multiple users at a Go
 * Request - POST
 * Accepts users handles, validate and send funds to attached bank account
 */
const bulkTransfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData;
    const { amount, reason, bizzers } = req.body;
    //Check for empty field
    if ((0, validations_1.isEmpty)(amount.toString()))
        return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "Amount must not be empty");
    //Check for empty bizzers list
    if (bizzers.length > 1) {
        try {
            //Check for valid authenticated user
            userData = yield models_1.User.findOne({ _id: req.user.id });
            if (!userData)
                return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "You can't carry out this operation..");
            //Check for sufficient balance
            if (amount * bizzers.lenghth > userData.available_balance)
                return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "Insufficient Fund: Kindly top up your bizz wallet to carry out this transaction");
            const data = yield (0, index_2.bizzRecipients)(bizzers);
            if (typeof data === "string")
                return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, data);
            //Create recipients params
            const recipientParams = JSON.stringify({
                batch: data
            });
            try {
                const recipient = yield (0, Savings_1.createRecipient)(index_1.BULK_RECIPIENT, recipientParams);
                //Create helper function to send transfer data
                const bizzersData = (0, index_2.createBizzersData)(recipient.data.success, amount, reason);
                //Check if recipient status is true
                if (recipient.status) {
                    //Create transfer params
                    const transferParams = JSON.stringify({
                        currency: "NGN",
                        source: "balance",
                        transfers: bizzersData
                    });
                    const transferRes = yield (0, Savings_1.transferFund)(index_1.BULK_TRANSFER, transferParams);
                    if (transferRes.status) {
                        //Create transaction and connection if not exist for each of the bizzers
                        yield (0, index_2.createTransactionAndConnection)(transferRes.data, userData, reason, req, data);
                        return (0, Utility_1.handleResponse)(res, Utility_1.success, OK, `You just rained on ${(yield bizzersData).length} bizzers`);
                    }
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
    }
    else {
        return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "You must select more than one bizzer to use this feature");
    }
});
exports.bulkTransfer = bulkTransfer;
