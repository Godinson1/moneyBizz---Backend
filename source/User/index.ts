import {
    getAllUser,
    deleteAllUser,
    activateUser,
    resetPassword,
    getUser,
    updatePassword,
    updateProfilePhoto,
    updateAccountDetails,
    addBVN,
    confirmBVN,
    autoSave,
    switchAutoSave,
    requestForFund
} from "./controller"
import { router } from "./routes"
import { uploadImage } from "./helpers"

export {
    getAllUser,
    autoSave,
    switchAutoSave,
    updateProfilePhoto,
    updateAccountDetails,
    requestForFund,
    router,
    deleteAllUser,
    resetPassword,
    activateUser,
    updatePassword,
    getUser,
    addBVN,
    confirmBVN,
    uploadImage
}
