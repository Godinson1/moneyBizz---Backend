import { userData, isEmpty, isEmail, isGreater } from "./index"

const validateReg = ({
    firstName,
    lastName,
    email,
    handle,
    password
}: userData): { errors: userData; valid: boolean } => {
    const errors = {} as userData
    if (isEmpty(email)) errors.email = "Email must not be empty"
    else if (!isEmail(email)) errors.email = "Must be a valid email address"

    if (isEmpty(password)) errors.password = "Password must not be empty"

    if (isGreater(password)) errors.password = "Password must have at least 6 characters"

    if (isEmpty(handle)) errors.handle = "Handle must not be empty"

    if (isEmpty(firstName)) errors.firstName = "First Name must not be empty"
    if (isEmpty(lastName)) errors.lastName = "Last Name must not be empty"

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

export { validateReg }
