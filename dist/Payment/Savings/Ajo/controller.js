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
exports.addAjoMember = exports.retrieveAjo = exports.activateAjo = exports.ajo = void 0;
const http_status_codes_1 = require("http-status-codes");
const models_1 = require("../../../models");
const validations_1 = require("../../../validations");
const index_1 = require("../index");
const helper_1 = require("./helper");
const Utility_1 = require("../../../Utility");
const { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = http_status_codes_1.StatusCodes;
/**
 * Route for collective saving (Collective Saving - AJO)
 * Request - POST
 * ---------------
 */
const ajo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reason, target_amount, terminatedAt, members } = req.body;
        if ((0, validations_1.isEmpty)(target_amount) || (0, validations_1.isEmpty)(terminatedAt))
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "Please fill out required fields");
        const userData = yield (0, helper_1.findUserByHandle)(req.user.handle);
        if (!userData)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, "User not found");
        const membersData = yield (0, index_1.addMember)(members, req.user.handle);
        const newAjo = new models_1.Ajo({
            createdBy: `${req.user.handle}`,
            reason,
            target_amount,
            total_balance: 0,
            total_credit: 0,
            total_debit: 0,
            ajo_code: (0, index_1.ajoCode)(),
            terminatedAt,
            members: membersData,
            status: true
        });
        const ajoData = yield newAjo.save();
        yield (0, index_1.notifyMembers)(members, ajoData._id, req.user.firstName, req.user.handle, ajoData.ajo_code);
        return res.status(OK).json({
            status: Utility_1.success,
            message: "Successfully Created Ajo",
            data: {
                createdBy: ajoData.createdBy,
                ajoCode: ajoData.ajo_code,
                reason: ajoData.reason,
                members: ajoData.members,
                terminatedAt
            }
        });
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.ajo = ajo;
const activateAjo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let ajoData;
    try {
        const { ajo_code } = req.body;
        if ((0, validations_1.isEmpty)(ajo_code))
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "Please fill out required fields");
        ajoData = yield models_1.Ajo.findOne({ ajo_code });
        if (!ajoData)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, "Ajo account not found");
        const ajoIndex = ajoData.members.findIndex((member) => member.handle === req.user.handle);
        if (ajoIndex === -1)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, "You are not a member of this Ajo account");
        if (ajoData.members[ajoIndex].active === true) {
            if (ajoIndex === -1)
                return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "You are already an active member of this Ajo account");
        }
        yield models_1.Ajo.updateOne({ ajo_code: ajoData.ajo_code, "members.handle": req.user.handle }, { $set: { "members.$.active": true } });
        return (0, Utility_1.handleResponse)(res, Utility_1.success, OK, "Successfully Activated Ajo");
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.activateAjo = activateAjo;
const retrieveAjo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ajoData = yield models_1.Ajo.findOne({ ajo_code: req.params.id });
        if (!ajoData)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, "Ajo account not found");
        return res.status(OK).json({
            status: Utility_1.success,
            message: "Successfully Retrieved Ajo",
            data: ajoData
        });
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.retrieveAjo = retrieveAjo;
const addAjoMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { members } = req.body;
    try {
        const ajoData = yield models_1.Ajo.findOne({ ajo_code: req.params.id });
        if (!ajoData)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, "Ajo account not found");
        if (members.length === 0)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "You need to add atleast one member");
        if (ajoData.createdBy !== `${req.user.handle}`)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, UNAUTHORIZED, "You are not authorised to perform this action");
        const data = yield (0, index_1.addNewMember)(members, ajoData.ajo_code, req.user.handle, req.user.firstName);
        if (typeof data === "string")
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, data);
        data.forEach((ajoMember) => {
            ajoData.members.push(ajoMember);
        });
        const newAjoData = yield ajoData.save();
        return res.status(OK).json({
            status: Utility_1.success,
            message: "Successfully Added Ajo Member(s)",
            data: newAjoData
        });
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.addAjoMember = addAjoMember;
