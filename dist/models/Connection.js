"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const connectionSchema = new Schema({
    connectorHandle: {
        type: String
    },
    connectorID: {
        type: String
    },
    connecteeHandle: {
        type: String
    },
    connectee_accountNumber: {
        type: Number
    },
    connectee_bank: {
        type: String
    },
    connectee_profilePhoto: {
        type: String
    }
}, {
    timestamps: true
});
const Connection = mongoose_1.default.model("Connection", connectionSchema);
exports.Connection = Connection;
