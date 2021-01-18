import express from "express"
import { fundAccount, confirmOtp, webhook } from "./controller"
import { auth } from "../Authentication"

const router = express.Router()

router.post("/fund", auth, fundAccount)
router.post("/otp", auth, confirmOtp)
router.post("/webhook", webhook)

export { router }
