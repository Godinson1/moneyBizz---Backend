"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_codes_1 = require("http-status-codes");
const Utility_1 = require("../Utility");
const { UNAUTHORIZED, BAD_REQUEST } = http_status_codes_1.StatusCodes;
const auth = (req, res, next) => {
    const token = req.header("mb-token");
    try {
        if (!token)
            (0, Utility_1.handleResponse)(res, Utility_1.error, UNAUTHORIZED, "Sorry, No Authorization!");
        const decodedToken = jsonwebtoken_1.default.verify(token, `${process.env.jwt_secret}`);
        req.user = decodedToken;
        next();
    }
    catch (e) {
        if (!token)
            (0, Utility_1.handleResponse)(res, Utility_1.error, BAD_REQUEST, "Invalid Token");
    }
};
exports.auth = auth;
