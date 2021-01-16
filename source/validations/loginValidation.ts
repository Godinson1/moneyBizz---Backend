import { loginData, isEmpty, isEmail, isGreater, isValidPhone } from "./index"

const checkData = (data: string): string => {
    if (data.trim().startsWith("0")) {
        return "phone"
    }
    return "email"
}

const validateLogin = ({ data, password }: loginData): { errors: loginData; valid: boolean } => {
    const errors = {} as loginData

    if (checkData(data) === "email") {
        if (isEmpty(data)) errors.data = "Email must not be empty"
        else if (!isEmail(data)) errors.data = "Must be a valid email address"
    }

    if (isEmpty(password)) errors.password = "Password must not be empty"
    if (isGreater(password)) errors.password = "Password must have at least 6 characters"

    if (checkData(data) === "phone") {
        if (isEmpty(data)) errors.data = "Phone number must not be empty"
        else if (!isValidPhone(data)) errors.data = "Must be a valid Nigeria Phone number"
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

export { validateLogin, checkData }
