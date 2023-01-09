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
exports.checkIp = exports.makeGetRequest = exports.makeRequest = exports.validateIP = exports.validateAmount = void 0;
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const validateAmount = (data) => {
    const result = data.toString().substring(0, data.length - 2);
    return parseInt(result);
};
exports.validateAmount = validateAmount;
const validateIP = (data) => {
    const hash = crypto_1.default.createHmac("sha512", `${process.env.SECRET_KEY}`).update(JSON.stringify(data)).digest("hex");
    return hash;
};
exports.validateIP = validateIP;
const checkIp = (ip) => {
    const acceptedIP = ["52.31.139.75", "52.49.173.169", "52.214.14.220"];
    if (acceptedIP.includes(ip))
        return true;
    else
        return false;
};
exports.checkIp = checkIp;
const makeRequest = (url, data) => __awaiter(void 0, void 0, void 0, function* () {
    const chargeResponse = yield axios_1.default.post(url, data, {
        headers: {
            Authorization: `Bearer ${process.env.testKey}`,
            "Content-Type": "application/json"
        }
    });
    return chargeResponse;
});
exports.makeRequest = makeRequest;
const makeGetRequest = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield axios_1.default.get(url, {
        headers: {
            Authorization: `Bearer ${process.env.testKey}`,
            "Content-Type": "application/json"
        }
    });
    return data;
});
exports.makeGetRequest = makeGetRequest;
