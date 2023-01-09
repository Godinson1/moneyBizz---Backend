"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResetPassword = void 0;
const index_1 = require("./index");
const validateResetPassword = ({ code, password }) => {
    const errors = {};
    if ((0, index_1.isEmpty)(code))
        errors.code = "Reset Code must not be empty";
    if ((0, index_1.isEmpty)(password))
        errors.password = "Password must not be empty";
    if ((0, index_1.isGreater)(password))
        errors.password = "Password must have at least 6 characters";
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    };
};
exports.validateResetPassword = validateResetPassword;
