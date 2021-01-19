import crypto from "crypto"

const validateAmount = (data: string): string => {
    const result = data.slice(0, -2)
    return result
}

const validateIP = (data: any): string => {
    const hash = crypto.createHmac("sha512", `${process.env.SECRET_KEY}`).update(JSON.stringify(data)).digest("hex")
    return hash
}

export { validateAmount, validateIP }
