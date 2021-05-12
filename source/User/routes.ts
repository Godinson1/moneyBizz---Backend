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
    autoSave,
    switchAutoSave,
    confirmBVN,
    checkCron
} from "./index"
import { auth } from "../Authentication"

const router = express.Router()

router.get("/", getAllUser)
router.get("/details", auth, getUser)
router.delete("/", deleteAllUser)
router.get("/check-cron", checkCron)
router.post("/activate", auth, activateUser)
router.post("/bvn", auth, addBVN)
router.post("/bvn/confirm", auth, confirmBVN)
router.put("/photo", auth, updateProfilePhoto)
router.put("/account", auth, updateAccountDetails)
router.post("/request-fund", auth, requestForFund)
router.post("/password/reset", resetPassword)
router.post("/password/update", updatePassword)
router.put("/autosave", auth, autoSave)
router.put("/autosave/switch", auth, switchAutoSave)

export { router }
