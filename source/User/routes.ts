import express from "express"
import {
    getAllUser,
    deleteAllUser,
    activateUser,
    resetPassword,
    updatePassword,
    updateProfilePhoto,
    updateAccountDetails,
    getUser,
    requestForFund,
    addBVN,
    confirmBVN
} from "./index"
import { auth } from "../Authentication"

const router = express.Router()

router.get("/", getAllUser)
router.get("/:id", auth, getUser)
router.delete("/", deleteAllUser)
router.post("/activate", auth, activateUser)
router.post("/bvn", auth, addBVN)
router.post("/bvn/confirm", auth, confirmBVN)
router.put("/photo", auth, updateProfilePhoto)
router.put("/account", auth, updateAccountDetails)
router.post("/request-fund", auth, requestForFund)
router.post("/password/reset", auth, resetPassword)
router.post("/password/update", auth, updatePassword)

export { router }
