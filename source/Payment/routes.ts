import express from "express"
import { confirmOtp, webhook, checkBalance } from "./controller"
import {
    fundAccountWithBankAccount,
    fundAccountWithCard,
    fundAccountWithExistingCard,
    debitAccount,
    autoFundAccount,
    ajo,
    activateAjo,
    retrieveAjo,
    addAjoMember
} from "./Savings"
import { auth } from "../Authentication"
import { singleTransfer, bulkTransfer } from "./Transfer"

const router = express.Router()

router.post("/fund", auth, fundAccountWithExistingCard)
router.post("/fund/bank", auth, fundAccountWithBankAccount)
router.post("/fund/card", auth, fundAccountWithCard)
router.post("/auto-fund", auth, autoFundAccount)
router.post("/debit", auth, debitAccount)
router.post("/otp", auth, confirmOtp)
router.post("/webhook", webhook)
router.get("/balance", checkBalance)
router.post("/ajo", auth, ajo)
router.post("/ajo/activate", auth, activateAjo)
router.get("/ajo/:id", auth, retrieveAjo)
router.post("/ajo/:id", auth, addAjoMember)
router.post("/transfer/single", auth, singleTransfer)
router.post("/transfer/bulk", auth, bulkTransfer)

export { router }
