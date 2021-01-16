import express from "express"
import { getAllUser, deleteAllUser } from "./index"
import { auth } from "../Authentication"

const router = express.Router()

router.get("/", getAllUser)

router.delete("/", auth, deleteAllUser)

export { router }
