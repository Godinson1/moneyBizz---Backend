import express from "express"
import { registerUser, loginUser } from "./controller"

// initializong express router
const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)

export { router }
