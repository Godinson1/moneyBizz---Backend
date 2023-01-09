"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transfer = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const transferSchema = new Schema({
    initiatorHandle: {
        type: String
    },
    initiatorID: {
        type: String
    },
    recipientHandle: {
        type: String
    },
    recipient_accountNumber: {
        type: Number
    },
    recipient_bank: {
        type: String
    },
    executed: {
        type: Boolean
    },
    transferCode: {
        type: String
    }
}, {
    timestamps: true
});
const Transfer = mongoose_1.default.model("Transfer", transferSchema);
exports.Transfer = Transfer;
