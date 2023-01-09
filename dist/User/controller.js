"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.checkCron = exports.getTransactions = exports.switchAutoSave = exports.autoSave = exports.updateAccountDetails = exports.requestForFund = exports.resetPassword = exports.VerifyUser = exports.confirmUserVerification = exports.getUser = exports.activateUser = exports.updatePassword = exports.updateProfilePhoto = exports.deleteAllUser = exports.getAllUser = void 0;
const models_1 = require("../models");
const http_status_codes_1 = require("http-status-codes");
const validations_1 = require("../validations");
const Payment_1 = require("../Payment");
const Utility_1 = require("../Utility");
const Authentication_1 = require("../Authentication");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_1 = require("./index");
const schedule = __importStar(require("node-schedule"));
const Savings_1 = require("../Payment/Savings");
const { OK, INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED, BAD_REQUEST } = http_status_codes_1.StatusCodes;
/*
 * NAME - getAllUser
 * REQUEST METHOD - GET
 * AIM - Retrieve all users from database
 */
const getAllUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield models_1.User.find({});
        return res.status(OK).json({
            status: Utility_1.success,
            message: "Users data retrieved successfully",
            data
        });
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.getAllUser = getAllUser;
/*
 * NAME - getUser
 * @REQUEST METHOD - GET
 * AIM - Retrieve single user from database
 */
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = yield (0, Payment_1.findUserByHandle)(req.user.handle);
        if (!userData)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, `User with @${req.user.handle} does not exist`);
        const connections = yield (0, Payment_1.findAllByHandle)("Connection", req.user.handle);
        const transactions = yield (0, Payment_1.findAllByHandle)("Transaction", req.user.handle);
        const notifications = yield (0, Payment_1.findAllByHandle)("Notification", req.user.handle);
        const data = {
            details: userData,
            connections,
            transactions,
            notifications,
            secret: `${process.env.pubKey}`
        };
        return res.status(OK).json({
            status: Utility_1.success,
            message: "User data retrieved successfully",
            data
        });
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.getUser = getUser;
/*
 * NAME - deleteAllUser
 * @REQUEST METHOD - DELETE
 * AIM - Delete all users from database
 */
const deleteAllUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield models_1.User.deleteMany({});
        return (0, Utility_1.handleResponse)(res, Utility_1.success, OK, "Users data deleted successfully");
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.deleteAllUser = deleteAllUser;
/*
 * NAME - activateUser
 * @REQUEST METHOD - POST
 * AIM - Activate newly registered user by sending unique code to user email address
 */
const activateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData;
    const { code } = req.body;
    if ((0, validations_1.isEmpty)(code))
        return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "Activation code cannot be empty..");
    try {
        userData = yield models_1.User.findOne({ mbCode: code });
        if (!userData)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, "Invalid Code, Please check code and try again");
        if (userData.active === true)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "Account already activated");
        if (req.user.id === userData.id) {
            userData.active = true;
            yield userData.save();
            return (0, Utility_1.handleResponse)(res, Utility_1.success, OK, "Users account activated successfully");
        }
        else {
            return (0, Utility_1.handleResponse)(res, Utility_1.error, UNAUTHORIZED, "You are not Authorised to perform this operation");
        }
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.activateUser = activateUser;
/*
 * NAME - Verify User
 * @REQUEST METHOD - PUT
 * AIM - Add user active mobile number and date of birth
 * with other info to update user's account
 * Send code to phone number for ownership verification
 */
const VerifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData;
    const { sex, phone, address, stateOrigin, dateOfBirth } = req.body;
    try {
        userData = yield (0, Payment_1.findUserByHandle)(req.user.handle);
        if (userData !== null) {
            userData = yield models_1.User.findOne({ handle: req.user.handle });
            userData.dateOfBirth = dateOfBirth;
            userData.phone = phone.toString();
            userData.sex = sex;
            userData.address = address;
            userData.stateOfOrigin = stateOrigin;
            userData.bvnOtp = (0, Authentication_1.uniqueCode)();
            const updatedUserData = yield (userData === null || userData === void 0 ? void 0 : userData.save());
            yield (0, Authentication_1.sendMobileOTP)(updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.bvnOtp, (0, Authentication_1.validatePhone)(updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.phone));
            return (0, Utility_1.handleResponse)(res, Utility_1.success, OK, "Phone number verified successfully, Please enter Otp to confirm ownership.");
        }
        else {
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "User not found!");
        }
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.VerifyUser = VerifyUser;
/*
 * NAME - confirmBVN
 * @REQUEST METHOD - POST
 * AIM - confirm user active phone with sent code to user's phone
 * If code matches, update bvnConfirmed field else don't update
 */
const confirmUserVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData;
    const { otp } = req.body;
    if ((0, validations_1.isEmpty)(otp.toString()))
        return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "OTP cannot be empty..");
    try {
        userData = yield models_1.User.findOne({ bvnOtp: otp });
        if (userData) {
            userData.bvnConfirmed = true;
            yield userData.save();
            return (0, Utility_1.handleResponse)(res, Utility_1.success, OK, "Phone number linked successfully");
        }
        else {
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "Invalid OTP provided");
        }
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.confirmUserVerification = confirmUserVerification;
/*
 * NAME - resetPassword
 * @REQUEST METHOD - POST
 * AIM - Reset user's password by confirming account through email
 * If account found, send a unique code to reset password
 * If not found, return error message of user with email not found
 */
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData;
    const { email } = req.body;
    if ((0, validations_1.isEmpty)(email) || !(0, validations_1.isEmail)(email))
        return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "Please enter a valid email address");
    try {
        userData = yield models_1.User.findOne({ email });
        if (userData) {
            userData.mbCode = (0, Authentication_1.bizzCode)();
            const data = yield userData.save();
            yield (0, Authentication_1.sendAuthMail)(Utility_1.type.PASSWORD_RESET, data.mbCode, data.email, data.firstName);
            return (0, Utility_1.handleResponse)(res, Utility_1.success, OK, "An email has been sent to the provided email address.");
        }
        else {
            return (0, Utility_1.handleResponse)(res, Utility_1.success, NOT_FOUND, `User with ${email} does not exist`);
        }
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.resetPassword = resetPassword;
/*
 * NAME - updatePassword
 * @REQUEST METHOD - POST
 * AIM - Update user's password
 * Provide reset code and new password
 */
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData;
    const { mbCode, password } = req.body;
    const { valid, errors } = (0, validations_1.validateResetPassword)({
        code: mbCode,
        password
    });
    if (!valid)
        return res.status(BAD_REQUEST).json({
            status: Utility_1.error,
            message: errors
        });
    try {
        userData = yield models_1.User.findOne({ mbCode });
        if (userData) {
            userData.password = password;
            bcryptjs_1.default.genSalt(10, (err, salt) => {
                bcryptjs_1.default.hash(userData.password, salt, (err, hash) => __awaiter(void 0, void 0, void 0, function* () {
                    if (err)
                        throw err;
                    userData.password = hash;
                    yield (userData === null || userData === void 0 ? void 0 : userData.save());
                    return (0, Utility_1.handleResponse)(res, Utility_1.success, OK, "Password updated successfully!");
                }));
            });
        }
        else {
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, `Invalid reset code provided`);
        }
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.updatePassword = updatePassword;
/*
 * NAME - updateProfilePhoto
 * @REQUEST METHOD - PUT
 * AIM - Update user's profile photo
 * Confirm authenticated user and update profile photo
 */
const updateProfilePhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData;
    const prefferedTypes = ["image/jpeg", "image/jpg", "image/png"];
    try {
        if (!req.files || req.files === null || Object.keys(req.files).length === 0)
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, `Please select a photo`);
        if (req.files.mb_image) {
            const image = req.files.mb_image;
            if (!prefferedTypes.includes(image.mimetype) && userData !== null)
                return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "Please select a valid photo");
            //Upload image
            const url = yield (0, index_1.uploadImage)(image);
            //Find authenticated user and update photo here
            userData = yield (0, Payment_1.findUserByHandle)(req.user.handle);
            userData.profile_photo = url;
            const data = yield (userData === null || userData === void 0 ? void 0 : userData.save());
            return res.status(OK).json({
                status: Utility_1.success,
                message: "Profile photo updated successfully..",
                data
            });
        }
        else {
            return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, `Please select a photo`);
        }
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.updateProfilePhoto = updateProfilePhoto;
/*
 * NAME - updateAccountDetails
 * @REQUEST METHOD - PUT
 * AIM - Update user's account details - Temporarily
 */
const updateAccountDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData;
    const { handle, code, account_number } = req.body;
    if (!handle || !code || !account_number)
        return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, `Please fill all required fields`);
    try {
        userData = yield (0, Payment_1.findUserByHandle)(handle);
        if (userData) {
            userData.bankCode = code;
            userData.accountNumber = account_number;
            yield userData.save();
            return (0, Utility_1.handleResponse)(res, Utility_1.success, OK, `Account details updated successfully..`);
        }
        else {
            return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, `User not found`);
        }
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.updateAccountDetails = updateAccountDetails;
/*
 * NAME - requestForFund
 * @REQUEST METHOD - POST
 * AIM - Request for funds from fellow bizzers
 */
const requestForFund = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData;
    const { handle, message, amount } = req.body;
    if (!handle || !message || !amount)
        return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, `Please fill all required fields`);
    try {
        userData = yield (0, Payment_1.findUserByHandle)(handle);
        if (userData) {
            if (userData.handle === req.user.handle)
                return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, `You can't request for Self Fund`);
            yield (0, Savings_1.createNotification)(req.user.handle, handle, req.user.firstName, "some-id", message, Utility_1.type.REQUEST_FUND, amount);
            return (0, Utility_1.handleResponse)(res, Utility_1.success, OK, `You successfully requested for fund from @${handle}.`);
        }
        else {
            return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, `User not found`);
        }
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.requestForFund = requestForFund;
/*
 * NAME - autoSave
 * @REQUEST METHOD - PUT
 * AIM - Update autosave setting
 */
const autoSave = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData;
    const { interval, minute, hour, dayOfMonth, dayOfWeek, amount, active } = req.body;
    try {
        userData = yield (0, Payment_1.findUserByHandle)(req.user.handle);
        if (userData) {
            const data = {
                active,
                interval,
                amount,
                minute,
                hour,
                dayOfMonth,
                dayOfWeek
            };
            userData.autoSave = data;
            yield userData.save();
            return (0, Utility_1.handleResponse)(res, Utility_1.success, OK, `Autosave settings updated successfully..`);
        }
        else {
            return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, `You can't carry out this operation.`);
        }
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.autoSave = autoSave;
/*
 * NAME - autoSave
 * @REQUEST METHOD - PUT
 * AIM - Update autosave setting
 */
const switchAutoSave = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userData;
    const { active } = req.body;
    try {
        userData = yield (0, Payment_1.findUserByHandle)(req.user.handle);
        if (userData) {
            const existingJob = schedule.scheduledJobs[req.user.email];
            if (existingJob === null || existingJob === undefined) {
                return (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, `Autosave settings not initiated.`);
            }
            else {
                existingJob.cancel();
                userData.autoSave.active = active;
                yield userData.save();
                return (0, Utility_1.handleResponse)(res, Utility_1.success, OK, `Autosave turned off successfully..`);
            }
        }
        else {
            return (0, Utility_1.handleResponse)(res, Utility_1.error, NOT_FOUND, `You can't carry out this operation.`);
        }
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, Utility_1.error, INTERNAL_SERVER_ERROR, "Something went wrong");
    }
});
exports.switchAutoSave = switchAutoSave;
const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pagination = req.body.pagination ? parseInt(req.body.pagination) : 10;
    //PageNumber From which Page to Start
    const pageNumber = req.body.page ? parseInt(req.body.page) : 1;
    try {
        const data = yield models_1.Transaction.find({ userId: req.user.userId });
        const data_result = yield models_1.Transaction.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pagination)
            .limit(pagination);
        const data_length = data.length;
        const num = data_length / pagination;
        const total_page = Number.isInteger(num) === true ? num : Math.ceil(num);
        return res.status(200).send({
            status: "success",
            message: "Data retrieved successfully.",
            total_result: data_length,
            total_page,
            data: data_result
        });
    }
    catch (err) {
        console.log(err);
        return (0, Utility_1.handleResponse)(res, "error", 500, "Something went wrong");
    }
});
exports.getTransactions = getTransactions;
const checkCron = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const runningJobs = yield schedule.scheduledJobs;
    console.log(runningJobs);
    return res.status(200).json({ message: "All running jobs for autosave" });
});
exports.checkCron = checkCron;
