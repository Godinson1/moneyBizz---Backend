import {
    getAllUser,
    deleteAllUser,
    activateUser,
    resetPassword,
    getUser,
    updatePassword,
    updateProfilePhoto,
    addBVN,
    confirmBVN
} from "./controller"
import { router } from "./routes"
import { uploadImage } from "./helpers"

export {
    getAllUser,
    updateProfilePhoto,
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
