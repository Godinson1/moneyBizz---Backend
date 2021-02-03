import { loginData, isEmpty, isEmail, isGreater } from "./index"

const checkData = (data: string): string => {
    //const isAvailable = data.toString().indexOf("@") !== -1
    if (data.indexOf("@") > -1) {
        return "email"
    }
    return "handle"
}

const validateLogin = ({ data, password }: loginData): { errors: loginData; valid: boolean } => {
    const errors = {} as loginData

    if (checkData(data) === "email") {
        if (isEmpty(data)) errors.data = "Email must not be empty"
        else if (!isEmail(data)) errors.data = "Must be a valid email address"
    }

    if (checkData(data) === "handle") {
        if (isEmpty(data)) errors.data = "Handle must not be empty"
    }

    if (isEmpty(password)) errors.password = "Password must not be empty"
    if (isGreater(password)) errors.password = "Password must have at least 6 characters"

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

export { validateLogin, checkData }
