"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatter = exports.resetPasswordBody = exports.fundWalletBody = exports.welcomeBody = exports.validateAmount = exports.fundWalletHeader = exports.welcomeHeader = exports.validatePhone = exports.debitWalletHeader = exports.debitWalletBody = exports.resetPasswordHeader = void 0;
const welcomeHeader = () => {
    return `Welcome to MoneyBizz `;
};
exports.welcomeHeader = welcomeHeader;
const resetPasswordHeader = () => {
    return `Reset your MoneyBizz Account Password`;
};
exports.resetPasswordHeader = resetPasswordHeader;
const fundWalletHeader = (firstName, amount, reference) => {
    return `${firstName}, ${formatter.format(validateAmount(amount))} has been added to your bizz wallet - [${reference}]`;
};
exports.fundWalletHeader = fundWalletHeader;
const debitWalletHeader = (firstName, amount, reference) => {
    return `${firstName}, ${formatter.format(validateAmount(amount))} has been debited from your bizz wallet - [${reference}]`;
};
exports.debitWalletHeader = debitWalletHeader;
const welcomeBody = (code, firstName) => {
    return `<h2>Hi ${firstName} &#128075;</h2> 
    <p>Thank you for choosing to join the FORCE as a MoneyBizzer.<br>
    <br>
    Your unique code is <b>${code}</b>
    <br> Thank you once again!</p> 
    <br><br>
    <b>All the best!</b>
    <br>
    <b>Team MoneyBizz<b>`;
};
exports.welcomeBody = welcomeBody;
const resetPasswordBody = (code, firstName) => {
    return `<h2>Hi ${firstName} &#128075;</h2> 
    <p>Someone has asked to reset the password for your account.<br>
    If you did not request a password reset, you can disregard this email.
    <br>
    No changes have been made to your account.
    <br><br>
    To reset your password, Kindly copy and provide the code below
    <br>
    Password reset code is <b>${code}</b>
    <br><br>
    <b>All the best!</b>
    <br>
    <b>Team MoneyBizz<b>`;
};
exports.resetPasswordBody = resetPasswordBody;
const fundWalletBody = (firstName, amount, reference, date, reason) => {
    return `<h2>Hello ${firstName} &#128075;</h2> 
    <p>Your MoneyBizz bizz wallet has been credited successfully.<br>
    <br>
    <b>Transaction Details</b><br>
    <br>Amount: <b style="color: green;">${formatter.format(validateAmount(amount))}</b>
    <br>
    Reason: ${reason}
    <br><br>
    Reference: ${reference}<br><br>
    Date: ${date}</p>
    <br><br>
    You are doing well &#128522;
    <br><br>
    <b>All the best!</b>
    <br>
    <b>Team MoneyBizz<b>`;
};
exports.fundWalletBody = fundWalletBody;
const debitWalletBody = (firstName, amount, reference, date, reason) => {
    return `<h2>Hello ${firstName} &#128075;</h2> 
    <p>Your MoneyBizz bizz wallet has been debited successfully.<br>
    <br>
    <b>Transaction Details</b><br>
    <br>Amount: <b style="color: red;">${formatter.format(validateAmount(amount))}</b>
    <br>
    Reason: ${reason}
    <br><br>
    Reference: ${reference}<br><br>
    Date: ${date}</p>
    <br><br>
    Keep up the good work &#128170;;
    <br><br>
    <b>All the best!</b>
    <br>
    <b>Team MoneyBizz<b>`;
};
exports.debitWalletBody = debitWalletBody;
const validateAmount = (data) => {
    const result = data.toString().substring(0, data.length - 2);
    return parseInt(result);
};
exports.validateAmount = validateAmount;
const validatePhone = (data) => {
    const phoneSignal = "+234";
    const newResult = data.toString().slice(1);
    return `${phoneSignal}${newResult}`;
};
exports.validatePhone = validatePhone;
const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2
});
exports.formatter = formatter;
