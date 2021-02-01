const isEmpty = (data: string): boolean => {
    if (data.trim() === "" || data.trim() === null || data.trim() === undefined || !data) {
        return true
    }
    return false
}

const isEmail = (data: string): boolean => {
    const regEx = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    if (data.match(regEx)) return true
    else return false
}

const isValidNumber = (data: string): boolean => {
    if (data.trim().length === 11) return true
    else return false
}

const isGreater = (data: string): boolean => {
    if (data.length < 6) return true
    else return false
}

export { isEmpty, isEmail, isGreater, isValidNumber }
