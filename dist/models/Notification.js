"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const notificationSchema = new Schema({
    sender: {
        type: String
    },
    receiver: {
        type: String
    },
    message: {
        type: String
    },
    read: {
        type: Boolean
    },
    type: {
        type: String
    },
    typeId: {
        type: String
    }
}, {
    timestamps: true
});
const Notification = mongoose_1.default.model("Notification", notificationSchema);
exports.Notification = Notification;
