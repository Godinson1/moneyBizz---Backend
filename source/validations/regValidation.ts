import { userData, isEmpty, isEmail, isGreater, isValidPhone } from "./index"

const validateReg = ({
    firstName,
    lastName,
    email,
    phone,
    password
}: userData): { errors: userData; valid: boolean } => {
    const errors = {} as userData
    if (isEmpty(email)) errors.email = "Email must not be empty"
    else if (!isEmail(email)) errors.email = "Must be a valid email address"

    if (isEmpty(password)) errors.password = "Password must not be empty"

    if (isGreater(password)) errors.password = "Password must have at least 6 characters"

    if (isEmpty(phone)) errors.phone = "Phone number must not be empty"
    else if (!isValidPhone(phone)) errors.phone = "Must be a valid Nigeria Phone number"

    if (isEmpty(firstName)) errors.firstName = "First Name must not be empty"
    if (isEmpty(lastName)) errors.lastName = "Last Name must not be empty"

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

export { validateReg }
