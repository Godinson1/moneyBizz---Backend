import { passwordData, isEmpty, isGreater } from "./index"

const validateResetPassword = ({ code, password }: passwordData): { errors: passwordData; valid: boolean } => {
    const errors = {} as passwordData

    if (isEmpty(code)) errors.code = "Reset Code must not be empty"

    if (isEmpty(password)) errors.password = "Password must not be empty"
    if (isGreater(password)) errors.password = "Password must have at least 6 characters"

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

export { validateResetPassword }
