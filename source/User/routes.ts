import express from "express"
import { getAllUser, deleteAllUser } from "./index"

const router = express.Router()

router.get("/", getAllUser)

router.delete("/", deleteAllUser)

export { router }
