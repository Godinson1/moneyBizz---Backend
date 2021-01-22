import express from "express"
import { confirmOtp, webhook, checkBalance } from "./controller"
import { fundAccount, ajo } from "./Savings"
import { auth } from "../Authentication"

const router = express.Router()

router.post("/fund", auth, fundAccount)
router.post("/otp", auth, confirmOtp)
router.post("/webhook", webhook)
router.get("/balance", checkBalance)
router.post("/ajo", auth, ajo)

export { router }
