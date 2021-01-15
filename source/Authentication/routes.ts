import express from "express"
import { registerUser } from "./controller"

// initializong express router
const router = express.Router()

router.post("/register", registerUser)

export { router }
