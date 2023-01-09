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
exports.APPROVED = exports.PHOTO_URL = exports.signInTestUser = exports.GMAIL = exports.type = exports.regData = exports.closeDBConnection = exports.handleResponse = exports.hasBotResult = exports.middlewareDetect = exports.connectToTestDB = exports.getUserIp = exports.userData = exports.source = exports.success = exports.error = void 0;
const node_device_detector_1 = __importDefault(require("node-device-detector"));
const test_1 = require("./test");
Object.defineProperty(exports, "connectToTestDB", { enumerable: true, get: function () { return test_1.connectToTestDB; } });
Object.defineProperty(exports, "userData", { enumerable: true, get: function () { return test_1.userData; } });
Object.defineProperty(exports, "regData", { enumerable: true, get: function () { return test_1.regData; } });
Object.defineProperty(exports, "closeDBConnection", { enumerable: true, get: function () { return test_1.closeDBConnection; } });
Object.defineProperty(exports, "signInTestUser", { enumerable: true, get: function () { return test_1.signInTestUser; } });
const deviceDetector = new node_device_detector_1.default();
const getUserIp = (req) => {
    let ip;
    if (req.headers["x-forwarded-for"]) {
        ip = req.headers["x-forwarded-for"].split(",")[0];
    }
    else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    }
    else {
        ip = req.ip;
    }
    return ip;
};
exports.getUserIp = getUserIp;
const middlewareDetect = (req, res, next) => {
    const useragent = req.headers["user-agent"];
    req.useragent = useragent;
    req.device = deviceDetector.detect(useragent);
    req.bot = deviceDetector.parseBot(useragent);
    next();
};
exports.middlewareDetect = middlewareDetect;
const hasBotResult = (result) => {
    return result && result.name;
};
exports.hasBotResult = hasBotResult;
const handleResponse = (res, status, code, message) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(code).json({
        status,
        message
    });
});
exports.handleResponse = handleResponse;
const error = "error";
exports.error = error;
const success = "success";
exports.success = success;
const source = "balance";
exports.source = source;
const GMAIL = "gmail";
exports.GMAIL = GMAIL;
const APPROVED = "Approved";
exports.APPROVED = APPROVED;
const PHOTO_URL = "https://storage.googleapis.com/bizz_bucket/noimg.png";
exports.PHOTO_URL = PHOTO_URL;
const type = {
    WELCOME: "welcome",
    TRANSFER: "transfer",
    DEBIT: "debit",
    FUND: "fund",
    REQUEST_FUND: "request_fund",
    AJO: "ajo",
    PASSWORD_RESET: "password_reset"
};
exports.type = type;
