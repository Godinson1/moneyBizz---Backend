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
    VerifyUser,
    autoSave,
    switchAutoSave,
    confirmUserVerification,
    checkCron,
    getProfilePhotoSignature
} from "./index"
import { auth } from "../Authentication"

const router = express.Router()

router.get("/", getAllUser)
router.get("/details", auth, getUser)
router.delete("/", deleteAllUser)
router.get("/check-cron", checkCron)
router.post("/activate", auth, activateUser)
router.put("/verify-user", auth, VerifyUser)
router.post("/verify-user-otp", auth, confirmUserVerification)
router.put("/photo", auth, updateProfilePhoto)
router.put("/account", auth, updateAccountDetails)
router.post("/request-fund", auth, requestForFund)
router.post("/password/reset", resetPassword)
router.post("/password/update", updatePassword)
router.put("/autosave", auth, autoSave)
router.get("/signature", auth, getProfilePhotoSignature)
router.put("/autosave/switch", auth, switchAutoSave)

export { router }
