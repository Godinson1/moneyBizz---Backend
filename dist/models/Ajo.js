"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ajo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const ajoSchema = new Schema({
    createdBy: {
        type: String
    },
    target_amount: {
        type: String
    },
    total_balance: {
        type: String
    },
    total_credit: {
        type: String
    },
    total_debit: {
        type: String
    },
    reason: {
        type: String
    },
    status: {
        type: String
    },
    ajo_code: {
        type: String
    },
    terminatedAt: {
        type: Date
    },
    members: {
        type: Array
    }
}, {
    timestamps: true
});
const Ajo = mongoose_1.default.model("Ajo", ajoSchema);
exports.Ajo = Ajo;
