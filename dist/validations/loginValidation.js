"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkData = exports.validateLogin = void 0;
const index_1 = require("./index");
const checkData = (data) => {
    //const isAvailable = data.toString().indexOf("@") !== -1
    if (data.indexOf("@") > -1) {
        return "email";
    }
    return "handle";
};
exports.checkData = checkData;
const validateLogin = ({ data, password }) => {
    const errors = {};
    if (checkData(data) === "email") {
        if ((0, index_1.isEmpty)(data))
            errors.data = "Email must not be empty";
        else if (!(0, index_1.isEmail)(data))
            errors.data = "Must be a valid email address";
    }
    if (checkData(data) === "handle") {
        if ((0, index_1.isEmpty)(data))
            errors.data = "Handle must not be empty";
    }
    if ((0, index_1.isEmpty)(password))
        errors.password = "Password must not be empty";
    if ((0, index_1.isGreater)(password))
        errors.password = "Password must have at least 6 characters";
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    };
};
exports.validateLogin = validateLogin;
