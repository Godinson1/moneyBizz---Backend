const welcomeHeader = (): string => {
    return `Welcome to MoneyBizz `
}

const resetPasswordHeader = (): string => {
    return `Reset your MoneyBizz Account Password`
}

const fundWalletHeader = (firstName: string, amount: string, reference: string): string => {
    return `${firstName}, ${formatter.format(
        validateAmount(amount)
    )} has been added to your bizz wallet - [${reference}]`
}

const debitWalletHeader = (firstName: string, amount: string, reference: string): string => {
    return `${firstName}, ${formatter.format(
        validateAmount(amount)
    )} has been debited from your bizz wallet - [${reference}]`
}

const welcomeBody = (code: string, firstName: string): string => {
    return `<h2>Hi ${firstName} &#128075;</h2> 
    <p>Thank you for choosing to join the FORCE as a MoneyBizzer.<br>
    <br>
    Your unique code is <b>${code}</b>
    <br> Thank you once again!</p> 
    <br><br>
    <b>All the best!</b>
    <br>
    <b>Team MoneyBizz<b>`
}

const resetPasswordBody = (code: string, firstName: string): string => {
    return `<h2>Hi ${firstName} &#128075;</h2> 
    <p>Someone has asked to reset the password for your account.<br>
    If you did not request a password reset, you can disregard this email.
    <br>
    No changes have been made to your account.
    <br><br>
    To reset your password, Kindly copy and provide the code below
    <br>
    Password reset code is <b>${code}</b>
    <br><br>
    <b>All the best!</b>
    <br>
    <b>Team MoneyBizz<b>`
}

const fundWalletBody = (
    firstName: string,
    amount: string,
    reference: string,
    date: string,
    reason: string | undefined
): string => {
    return `<h2>Hello ${firstName} &#128075;</h2> 
    <p>Your MoneyBizz bizz wallet has been credited successfully.<br>
    <br>
    <b>Transaction Details</b><br>
    <br>Amount: <b style="color: green;">${formatter.format(validateAmount(amount))}</b>
    <br>
    Reason: ${reason}
    <br><br>
    Reference: ${reference}<br><br>
    Date: ${date}</p>
    <br><br>
    You are doing well &#128522;
    <br><br>
    <b>All the best!</b>
    <br>
    <b>Team MoneyBizz<b>`
}

const debitWalletBody = (
    firstName: string,
    amount: string,
    reference: string,
    date: string,
    reason: string | undefined
): string => {
    return `<h2>Hello ${firstName} &#128075;</h2> 
    <p>Your MoneyBizz bizz wallet has been debited successfully.<br>
    <br>
    <b>Transaction Details</b><br>
    <br>Amount: <b style="color: red;">${formatter.format(validateAmount(amount))}</b>
    <br>
    Reason: ${reason}
    <br><br>
    Reference: ${reference}<br><br>
    Date: ${date}</p>
    <br><br>
    Keep up the good work &#128170;;
    <br><br>
    <b>All the best!</b>
    <br>
    <b>Team MoneyBizz<b>`
}

const validateAmount = (data: string): number => {
    const result = data.toString().substring(0, data.length - 2)
    return parseInt(result)
}

const validatePhone = (data: string | undefined): string => {
    const phoneSignal = "+234"
    const newResult = (data as string).toString().slice(1)
    return `${phoneSignal}${newResult}`
}

const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2
})

export {
    resetPasswordHeader,
    debitWalletBody,
    debitWalletHeader,
    validatePhone,
    welcomeHeader,
    fundWalletHeader,
    validateAmount,
    welcomeBody,
    fundWalletBody,
    resetPasswordBody,
    formatter
}
