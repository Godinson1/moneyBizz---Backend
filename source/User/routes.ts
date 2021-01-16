import express from "express"
import { getAllUser, deleteAllUser, activateUser } from "./index"
import { auth } from "../Authentication"

const router = express.Router()

router.get("/", getAllUser)
router.delete("/", auth, deleteAllUser)
router.post("/activate", auth, activateUser)

export { router }
