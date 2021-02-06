const CHARGE_URL = "https://api.paystack.co/charge"
const OTP_URL = "https://api.paystack.co/charge/submit_otp"
const BALANCE = "https://api.paystack.co/balance"
const BVN = "https://api.paystack.co/identity/bvn/resolve"
const RESOLVE_ACCOUNT = "https://api.paystack.co/bank/resolve?"
const CREATE_RECIPIENT = "https://api.paystack.co/transferrecipient"
const BULK_RECIPIENT = "https://api.paystack.co/transferrecipient/bulk"
const TRANSFER = "https://api.paystack.co/transfer"
const BULK_TRANSFER = "https://api.paystack.co/transfer/bulk"
const BANK = "https://api.paystack.co/bank"
const PLAN = "https://api.paystack.co/plan"
const SUBSCRIPTION = "https://api.paystack.co/subscription"
const INITIALIZE_TRANSACTION = "https://api.paystack.co/transaction/initialize"
const CHARGE_AUTHORIZATION = "https://api.paystack.co/transaction/charge_authorization"

export {
    CHARGE_URL,
    OTP_URL,
    BALANCE,
    BVN,
    PLAN,
    SUBSCRIPTION,
    CHARGE_AUTHORIZATION,
    INITIALIZE_TRANSACTION,
    RESOLVE_ACCOUNT,
    BULK_RECIPIENT,
    BULK_TRANSFER,
    CREATE_RECIPIENT,
    TRANSFER,
    BANK
}
