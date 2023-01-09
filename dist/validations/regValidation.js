"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateReg = void 0;
const index_1 = require("./index");
const validateReg = ({ firstName, lastName, email, handle, password }) => {
    const errors = {};
    if ((0, index_1.isEmpty)(email))
        errors.email = "Email must not be empty";
    else if (!(0, index_1.isEmail)(email))
        errors.email = "Must be a valid email address";
    if ((0, index_1.isEmpty)(password))
        errors.password = "Password must not be empty";
    if ((0, index_1.isGreater)(password))
        errors.password = "Password must have at least 6 characters";
    if ((0, index_1.isEmpty)(handle))
        errors.handle = "Handle must not be empty";
    if ((0, index_1.isEmpty)(firstName))
        errors.firstName = "First Name must not be empty";
    if ((0, index_1.isEmpty)(lastName))
        errors.lastName = "Last Name must not be empty";
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    };
};
exports.validateReg = validateReg;
