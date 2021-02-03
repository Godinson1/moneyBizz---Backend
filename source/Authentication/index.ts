import { router } from "./routes"
import { jwtSignUser, sendAuthMail, bizzCode, uniqueCode, sendMobileOTP, sendTransactionMail } from "./helper"
import { auth } from "./middleware"
import { welcomeBody, welcomeHeader, fundWalletBody, validatePhone, fundWalletHeader } from "./data"

export {
    router,
    jwtSignUser,
    sendAuthMail,
    bizzCode,
    uniqueCode,
    validatePhone,
    auth,
    welcomeHeader,
    welcomeBody,
    fundWalletHeader,
    fundWalletBody,
    sendTransactionMail,
    sendMobileOTP
}
