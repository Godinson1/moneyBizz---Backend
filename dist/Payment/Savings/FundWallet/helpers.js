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
exports.chargeUser = exports.createTransaction = exports.getInterval = exports.transferFund = exports.createRecipient = exports.resolveBanks = exports.resolveAccount = void 0;
const axios_1 = __importDefault(require("axios"));
const index_1 = require("../../index");
const models_1 = require("../../../models");
const Utility_1 = require("../../../Utility");
const resolveAccount = (url, accountNumber, bankCode) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield axios_1.default.get(`${url}account_number=${accountNumber}&bank_code=${bankCode}`, {
        headers: {
            Authorization: `Bearer ${process.env.testKey}`,
            "Content-Type": "application/json"
        }
    });
    return res;
});
exports.resolveAccount = resolveAccount;
const resolveBanks = () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, index_1.makeGetRequest)(index_1.BANK);
    return res;
});
exports.resolveBanks = resolveBanks;
const createRecipient = (url, data) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, index_1.makeRequest)(url, data);
    return res.data;
});
exports.createRecipient = createRecipient;
const transferFund = (url, data) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, index_1.makeRequest)(url, data);
    return res.data;
});
exports.transferFund = transferFund;
const createTransaction = (userData, req, amount, ref, transactionType, reason) => __awaiter(void 0, void 0, void 0, function* () {
    const newTransaction = new models_1.Transaction({
        initiatorHandle: userData === null || userData === void 0 ? void 0 : userData.handle,
        initiator_phone: userData === null || userData === void 0 ? void 0 : userData.phone,
        initiator_bankCode: userData === null || userData === void 0 ? void 0 : userData.bankCode,
        initiator_bank: userData === null || userData === void 0 ? void 0 : userData.bank,
        initiator_accountNumber: userData === null || userData === void 0 ? void 0 : userData.accountNumber,
        recipient: "self",
        recipient_bank: "self",
        recipient_accountNumber: "self",
        reason: transactionType === Utility_1.type.FUND ? "Top up wallet" : reason,
        amount,
        ref,
        deviceIp: (0, Utility_1.getUserIp)(req),
        deviceInfo: {
            device: req.device,
            userAgent: req.useragent
        },
        executedAt: Date.now(),
        createdAt: Date.now(),
        executed: false,
        status: "in-process",
        type: Utility_1.type.FUND
    });
    userData.ref = ref;
    yield (userData === null || userData === void 0 ? void 0 : userData.save());
    yield newTransaction.save();
});
exports.createTransaction = createTransaction;
const chargeUser = (userData, req, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = JSON.stringify({
            email: req.user.email,
            amount,
            authorization_code: userData === null || userData === void 0 ? void 0 : userData.authorization[0].authorization_code
        });
        const chargeResponse = yield (0, index_1.makeRequest)(index_1.CHARGE_AUTHORIZATION, params);
        if (chargeResponse.data.status) {
            yield createTransaction(userData, req, amount.toString(), chargeResponse.data.data.reference, Utility_1.type.FUND);
        }
        return chargeResponse;
    }
    catch (err) {
        console.log(err);
        return err.response.data.message;
    }
});
exports.chargeUser = chargeUser;
const getInterval = (interval, minute, hour, dayOfMonth, dayOfWeek) => {
    let setInterval = "";
    if (interval === "weekly") {
        setInterval = `${minute} ${hour} * * ${dayOfWeek}`;
    }
    else if (interval === "daily") {
        setInterval = `${minute} ${hour} * * *`;
    }
    else if (interval === "monthly") {
        setInterval = `${minute} ${hour} ${dayOfMonth} * *`;
    }
    else {
        setInterval = `*/2 * * * *`;
    }
    return setInterval;
};
exports.getInterval = getInterval;
