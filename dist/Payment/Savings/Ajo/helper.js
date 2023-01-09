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
exports.createNotification = exports.addNewMember = exports.findAllByHandle = exports.findUserByHandle = exports.notifyMembers = exports.ajoCode = exports.addMember = void 0;
const models_1 = require("../../../models");
const Utility_1 = require("../../../Utility");
const Authentication_1 = require("../../../Authentication");
const addMember = (array, handle) => __awaiter(void 0, void 0, void 0, function* () {
    const addedMembers = [];
    for (let i = 0; i < array.length; i++) {
        const userData = yield findUserByHandle(array[i].handle);
        if (userData) {
            addedMembers.push({
                name: `${userData.firstName} ${userData.lastName}`,
                phone: userData.phone,
                handle: userData.handle,
                bank: userData.bank || null,
                bankCode: userData.bankCode || null,
                accountNumber: userData.accountNumber || null,
                total_debit: 0,
                total_credit: 0,
                ajo_code: "",
                active: userData.handle === handle ? true : false
            });
        }
    }
    return addedMembers;
});
exports.addMember = addMember;
const ajoCode = () => {
    return `ajo_${Math.floor(100000 + Math.random() * 900000)}`;
};
exports.ajoCode = ajoCode;
const notifyMembers = (array, ajoId, userFirstName, userHandle, ajoCode) => __awaiter(void 0, void 0, void 0, function* () {
    for (let i = 0; i < array.length; i++) {
        const userData = yield findUserByHandle(array[i].handle);
        if (userData) {
            yield createNotification(Utility_1.type.AJO, userHandle, userData.handle, userFirstName, ajoId, ajoCode, 0);
        }
    }
    return true;
});
exports.notifyMembers = notifyMembers;
const findUserByHandle = (searchValue) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield models_1.User.findOne({ handle: searchValue }).select("-password");
    return data;
});
exports.findUserByHandle = findUserByHandle;
const findAllByHandle = (ModelType, searchValue) => __awaiter(void 0, void 0, void 0, function* () {
    let data;
    if (ModelType === "Notification") {
        data = yield models_1.Notification.find({ receiver: searchValue }).sort({ createdAt: -1 }).limit(20);
        return data;
    }
    else if (ModelType === "Transaction") {
        data = yield models_1.Transaction.find({ initiatorHandle: searchValue }).sort({ createdAt: -1 }).limit(20);
        return data;
    }
    else if (ModelType === "Connection") {
        data = yield models_1.Connection.find({ connectorHandle: searchValue }).sort({ createdAt: -1 }).limit(20);
        return data;
    }
    else {
        return [];
    }
});
exports.findAllByHandle = findAllByHandle;
const addNewMember = (array, ajo_code, userHandle, userFirstName) => __awaiter(void 0, void 0, void 0, function* () {
    const res = {};
    const addedMembers = [];
    for (let i = 0; i < array.length; i++) {
        const userData = yield findUserByHandle(array[i].handle);
        if (userData) {
            const ajoData = yield models_1.Ajo.findOne({ ajo_code });
            const isExist = ajoData === null || ajoData === void 0 ? void 0 : ajoData.members.find((member) => member.handle === array[i].handle);
            if (isExist) {
                return (res.error = `User with ${array[i].handle} is already added`);
            }
            else {
                addedMembers.push({
                    name: `${userData.firstName} ${userData.lastName}`,
                    phone: userData.phone,
                    handle: userData.handle,
                    bank: userData.bank || null,
                    bankCode: userData.bankCode || null,
                    accountNumber: userData.accountNumber || null,
                    total_debit: 0,
                    total_credit: 0,
                    ajo_code: "",
                    active: false
                });
                yield createNotification(Utility_1.type.AJO, userHandle, userData.handle, userFirstName, ajoData === null || ajoData === void 0 ? void 0 : ajoData.id, ajo_code, 0);
            }
        }
        else {
            return `User with ${array[i].handle} does not exist`;
        }
    }
    return addedMembers;
});
exports.addNewMember = addNewMember;
const createNotification = (sender, receiver, senderFirstName, id, code, notificationType, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const notify = new models_1.Notification({
        sender,
        receiver,
        read: false,
        type: notificationType,
        typeId: id,
        message: notificationType === Utility_1.type.TRANSFER
            ? `${senderFirstName} - @${sender} just transferred ${Authentication_1.formatter.format((0, Authentication_1.validateAmount)(amount.toString()))} to your attached account.`
            : notificationType === Utility_1.type.AJO && sender === receiver
                ? `You created AJo account!! Your Ajo Code is - ${code}.`
                : notificationType === Utility_1.type.AJO && sender !== receiver
                    ? `${senderFirstName} created Ajo account and added you.`
                    : notificationType === Utility_1.type.REQUEST_FUND
                        ? `Fund Request - @${sender} has requested the sum of ${Authentication_1.formatter.format((0, Authentication_1.validateAmount)(amount.toString()))} from you. "${code}"`
                        : ""
    });
    yield notify.save();
});
exports.createNotification = createNotification;
