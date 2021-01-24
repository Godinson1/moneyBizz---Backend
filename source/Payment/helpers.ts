import crypto from "crypto"
import axios from "axios"
import { otpData, chargeData } from "./index"

const validateAmount = (data: string): string => {
    const result = data.slice(0, -2)
    return result
}

const validateIP = (data: string): string => {
    const hash = crypto.createHmac("sha512", `${process.env.SECRET_KEY}`).update(JSON.stringify(data)).digest("hex")
    return hash
}

const makeRequest = async (url: string, data: string): Promise<any> => {
    const chargeResponse = await axios.post(url, data, {
        headers: {
            Authorization: `Bearer ${process.env.testKey}`,
            "Content-Type": "application/json"
        }
    })
    return chargeResponse
}

export { validateAmount, validateIP, makeRequest }
