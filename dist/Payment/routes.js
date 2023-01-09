"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const controller_1 = require("./controller");
const Savings_1 = require("./Savings");
const Authentication_1 = require("../Authentication");
const Transfer_1 = require("./Transfer");
const router = express_1.default.Router();
exports.router = router;
router.post("/fund", Authentication_1.auth, Savings_1.fundAccountWithExistingCard);
router.post("/fund/bank", Authentication_1.auth, Savings_1.fundAccountWithBankAccount);
router.post("/fund/card", Authentication_1.auth, Savings_1.fundAccountWithCard);
router.post("/auto-fund", Authentication_1.auth, Savings_1.autoFundAccount);
router.post("/debit", Authentication_1.auth, Savings_1.debitAccount);
router.post("/otp", Authentication_1.auth, controller_1.confirmOtp);
router.post("/webhook", controller_1.webhook);
router.get("/balance", controller_1.checkBalance);
router.post("/ajo", Authentication_1.auth, Savings_1.ajo);
router.post("/ajo/activate", Authentication_1.auth, Savings_1.activateAjo);
router.get("/ajo/:id", Authentication_1.auth, Savings_1.retrieveAjo);
router.post("/ajo/:id", Authentication_1.auth, Savings_1.addAjoMember);
router.post("/transfer/single", Authentication_1.auth, Transfer_1.singleTransfer);
router.post("/transfer/bulk", Authentication_1.auth, Transfer_1.bulkTransfer);
