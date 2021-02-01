import crypto from "crypto"
import axios, { AxiosResponse } from "axios"

const validateAmount = (data: string): number => {
    const result = data.substring(0, data.length - 2)
    return parseInt(result)
}

const validateIP = (data: string): string => {
    const hash = crypto.createHmac("sha512", `${process.env.SECRET_KEY}`).update(JSON.stringify(data)).digest("hex")
    return hash
}

const makeRequest = async (url: string, data: string): Promise<AxiosResponse> => {
    const chargeResponse = await axios.post(url, data, {
        headers: {
            Authorization: `Bearer ${process.env.testKey}`,
            "Content-Type": "application/json"
        }
    })
    return chargeResponse
}

const makeGetRequest = async (url: string): Promise<AxiosResponse> => {
    const data = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${process.env.testKey}`,
            "Content-Type": "application/json"
        }
    })
    return data
}

export { validateAmount, validateIP, makeRequest, makeGetRequest }
