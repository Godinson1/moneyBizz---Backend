import axios, { AxiosResponse } from "axios"
import { makeGetRequest, makeRequest, BANK, CHARGE_AUTHORIZATION } from "../../index"
import { IUser, Transaction } from "../../../models"
import { Request } from "express"
import { type, getUserIp } from "../../../Utility"

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

const createTransaction = async (
    userData: IUser | null,
    req: Request,
    amount: string,
    ref: string,
    transactionType: string,
    reason?: string
): Promise<void> => {
    const newTransaction = new Transaction({
        initiatorHandle: userData?.handle,
        initiator_phone: userData?.phone,
        initiator_bankCode: userData?.bankCode,
        initiator_bank: userData?.bank,
        initiator_accountNumber: userData?.accountNumber,
        recipient: "self",
        recipient_bank: "self",
        recipient_accountNumber: "self",
        reason: transactionType === type.FUND ? "Top up wallet" : reason,
        amount,
        ref,
        deviceIp: getUserIp(req),
        deviceInfo: {
            device: req.device,
            userAgent: req.useragent
        },
        executedAt: Date.now(),
        createdAt: Date.now(),
        executed: false,
        status: "in-process",
        type: type.FUND
    })
    userData!.ref = ref
    await userData?.save()
    await newTransaction.save()
}

const chargeUser = async (userData: IUser, req: Request, amount: string): Promise<AxiosResponse> => {
    try {
        const params = JSON.stringify({
            email: req.user.email,
            amount,
            authorization_code: userData.authorization[0].authorization_code
        })

        const chargeResponse = await makeRequest(CHARGE_AUTHORIZATION, params)
        if (chargeResponse.data.status) {
            await createTransaction(userData, req, amount.toString(), chargeResponse.data.data.reference, type.FUND)
        }
        return chargeResponse
    } catch (err) {
        console.log(err)
        return err.response.data.message
    }
}

export { resolveAccount, resolveBanks, createRecipient, transferFund, createTransaction, chargeUser }
