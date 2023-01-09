"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const transactionSchema = new Schema({
    initiatorHandle: {
        type: String
    },
    initiator_phone: {
        type: String
    },
    initiator_bank: {
        type: String
    },
    initiator_bankCode: {
        type: String
    },
    initiator_accountNumber: {
        type: String
    },
    recipient_bank: {
        type: String
    },
    recipient_accountNumber: {
        type: String
    },
    recipient: {
        type: String
    },
    amount: {
        type: String
    },
    reason: {
        type: String
    },
    status: {
        type: String
    },
    deviceIp: {
        type: String
    },
    deviceInfo: {
        type: Object
    },
    ref: {
        type: String
    },
    type: {
        type: String
    },
    executedAt: {
        type: Date
    },
    executed: {
        type: Boolean
    }
}, {
    timestamps: true
});
const Transaction = mongoose_1.default.model("Transaction", transactionSchema);
exports.Transaction = Transaction;
