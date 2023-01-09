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
exports.createTransactionAndConnection = exports.createTransfer = exports.createBizzersData = exports.bizzRecipients = void 0;
const Savings_1 = require("../Savings");
const models_1 = require("../../models");
const Utility_1 = require("../../Utility");
const bizzRecipients = (array) => __awaiter(void 0, void 0, void 0, function* () {
    const addedMembers = [];
    for (let i = 0; i < array.length; i++) {
        const userData = yield (0, Savings_1.findUserByHandle)(array[i].handle);
        if (userData) {
            addedMembers.push({
                type: "nuban",
                name: userData.handle,
                account_number: userData.accountNumber,
                bank_code: userData.bankCode,
                currency: "NGN"
            });
        }
        else {
            return `User with @${array[i].handle} does not exist.`;
        }
    }
    return addedMembers;
});
exports.bizzRecipients = bizzRecipients;
const createBizzersData = (array, amount, reason) => __awaiter(void 0, void 0, void 0, function* () {
    const addedRecipients = [];
    for (let i = 0; i < array.length; i++) {
        addedRecipients.push({
            amount,
            recipient: array[i].recipient_code,
            reason
        });
    }
    return addedRecipients;
});
exports.createBizzersData = createBizzersData;
const createTransactionAndConnection = (array, user, reason, req, bizzerData) => __awaiter(void 0, void 0, void 0, function* () {
    for (let i = 0; i < array.length; i++) {
        const newTransaction = new models_1.Transaction({
            initiatorHandle: user.handle,
            initiator_phone: user.phone,
            initiator_bankCode: user.bankCode,
            initiator_bank: user.bank,
            initiator_accountNumber: user.accountNumber,
            recipient: bizzerData[i].name,
            recipient_bank: bizzerData[i].bank_code,
            recipient_accountNumber: bizzerData[i].account_number,
            reason: reason,
            amount: array[i].amount.toString(),
            ref: array[i].transfer_code,
            deviceIp: (0, Utility_1.getUserIp)(req),
            deviceInfo: {
                device: req.device,
                userAgent: req.useragent
            },
            executedAt: Date.now(),
            createdAt: Date.now(),
            executed: false,
            status: "in-process",
            type: Utility_1.type.TRANSFER
        });
        //Check if connection has been established
        const connectionExist = models_1.Connection.findOne({
            $and: [{ connecteeHandle: { $eq: bizzerData[i].name } }, { connectorHandle: { $eq: user.handle } }]
        });
        //If no connection has been established, create one!
        if (!connectionExist) {
            const newConnection = new models_1.Connection({
                connectorID: user.id,
                connectorHandle: user.handle,
                connectee_accountNumber: bizzerData[i].account_number,
                connectee_bank: bizzerData[i].bank_code,
                connectee_profilePhoto: "photo_url",
                connecteeHandle: bizzerData[i].name
            });
            yield newConnection.save();
        }
        yield newTransaction.save();
    }
    return "Transactions created successfully";
});
exports.createTransactionAndConnection = createTransactionAndConnection;
const createTransfer = (user, bizzerData, code) => __awaiter(void 0, void 0, void 0, function* () {
    const newTransfer = new models_1.Connection({
        connectorID: user.id,
        connectorHandle: user.handle,
        connectee_accountNumber: bizzerData.accountNumber,
        connectee_bank: bizzerData.bankCode,
        transferCode: code,
        executed: false,
        connecteeHandle: bizzerData.handle
    });
    yield newTransfer.save();
    //Check if connection has been established
    const connectionExist = models_1.Connection.findOne({
        $and: [{ connecteeHandle: { $eq: bizzerData.handle } }, { connectorHandle: { $eq: user.handle } }]
    });
    //If no connection has been established, create one!
    if (!connectionExist) {
        const newConnection = new models_1.Connection({
            connectorID: user.id,
            connectorHandle: user.handle,
            connectee_accountNumber: bizzerData.accountNumber,
            connectee_bank: bizzerData.bankCode,
            connectee_profilePhoto: bizzerData.profile_photo,
            connecteeHandle: bizzerData.handle
        });
        yield newConnection.save();
    }
});
exports.createTransfer = createTransfer;
