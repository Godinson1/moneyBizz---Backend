import axios, { AxiosResponse } from "axios"
import { makeGetRequest, makeRequest, BANK } from "../../index"

const resolveAccount = async (url: string, accountNumber: string, bankCode: string): Promise<AxiosResponse> => {
    const res = await axios.get(`${url}account_number=${accountNumber}&bank_code=${bankCode}`, {
        headers: {
            Authorization: `Bearer ${process.env.testKey}`,
            "Content-Type": "application/json"
        }
    })
    return res
}

const resolveBanks = async (): Promise<AxiosResponse> => {
    const res = await makeGetRequest(BANK)
    return res
}

const createRecipient = async (url: string, data: string): Promise<AxiosResponse> => {
    const res = await makeRequest(url, data)
    return res.data
}

const transferFund = async (url: string, data: string): Promise<AxiosResponse> => {
    const res = await makeRequest(url, data)
    return res.data
}

export { resolveAccount, resolveBanks, createRecipient, transferFund }
