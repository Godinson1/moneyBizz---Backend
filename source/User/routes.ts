import express from "express"
import { getAllUser, deleteAllUser, activateUser, getUser } from "./index"
import { auth } from "../Authentication"

const router = express.Router()

router.get("/", getAllUser)
router.get("/:id", auth, getUser)
router.delete("/", deleteAllUser)
router.post("/activate", auth, activateUser)

export { router }
