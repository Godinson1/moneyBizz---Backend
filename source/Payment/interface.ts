interface chargeData {
    email: string
    amount: string
    bank: {
        code: string
        account_number: string
    }
    birthday: string
}

interface otpData {
    otp: string
    reference: string
}

export { chargeData, otpData }
