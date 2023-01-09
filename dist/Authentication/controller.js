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
exports.loginUser = exports.registerUser = void 0;
const validations_1 = require("../validations");
const http_status_codes_1 = require("http-status-codes");
const models_1 = require("../models/");
const index_1 = require("./index");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Utility_1 = require("../Utility");
const { BAD_REQUEST, INTERNAL_SERVER_ERROR, CREATED, OK } = http_status_codes_1.StatusCodes;
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, firstName, lastName, handle, password } = req.body;
        const { errors, valid } = (0, validations_1.validateReg)({
            email,
            firstName,
            lastName,
            handle,
            password
        });
        if (!valid)
            return res.status(BAD_REQUEST).json({
                status: Utility_1.error,
                message: errors
            });
        const alreadyExist = yield models_1.User.findOne({ $or: [{ email: { $eq: email } }, { handle: { $eq: handle } }] });
        if (alreadyExist)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, `User with email/handle already exist`);
        const newUser = new models_1.User({
            firstName,
            lastName,
            password,
            email,
            autoSave: {
                active: false,
                interval: "",
                amount: 0,
                minute: 0,
                hour: 0,
                dayOfMonth: 0,
                dayOfWeek: 0
            },
            bvnConfirmed: false,
            bvnBlacklisted: true,
            handle,
            total_balance: 0,
            authorization: [],
            profile_photo: Utility_1.PHOTO_URL,
            total_credit: 0,
            total_debit: 0,
            available_balance: 0,
            mbCode: (0, index_1.bizzCode)(),
            active: false
        });
        bcryptjs_1.default.genSalt(10, (err, salt) => {
            bcryptjs_1.default.hash(newUser.password, salt, (err, hash) => __awaiter(void 0, void 0, void 0, function* () {
                if (err)
                    throw err;
                newUser.password = hash;
                const data = yield newUser.save();
                const token = (0, index_1.jwtSignUser)(data);
                yield (0, index_1.sendAuthMail)(Utility_1.type.WELCOME, data.mbCode, email, firstName);
                return res.status(CREATED).json({
                    status: Utility_1.success,
                    token,
                    message: "Successfully registered"
                });
            }));
        });
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, password } = req.body;
        const { errors, valid } = (0, validations_1.validateLogin)({
            data,
            password
        });
        if (!valid)
            return res.status(BAD_REQUEST).json({
                status: Utility_1.error,
                message: errors
            });
        const userData = yield models_1.User.findOne({ $or: [{ email: { $eq: data } }, { handle: { $eq: data } }] });
        if (!userData)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, `User with ${data} does not exist`);
        const isMatched = yield bcryptjs_1.default.compare(password, userData.password);
        if (!isMatched)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "Invalid Credentials");
        const token = (0, index_1.jwtSignUser)(userData);
        return res.status(OK).json({
            status: Utility_1.success,
            token,
            message: "Successfully Signed in"
        });
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.loginUser = loginUser;
