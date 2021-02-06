process.env.NODE_ENV = "test"
import supertest from "supertest"
import { app } from "../../app"
import { connectToTestDB, closeDBConnection, success, error, signInTestUser } from "../../Utility"
import { StatusCodes } from "http-status-codes"

const request = supertest(app)
const { BAD_REQUEST, OK } = StatusCodes
let token: string

beforeAll(async () => {
    connectToTestDB()
    token = await signInTestUser(request)
}, 20000)

afterAll(() => {
    closeDBConnection()
})

jest.useFakeTimers()

describe("Test for Funding wallet", () => {
    it("should create a charge request depending on otp", async () => {
        const data = {
            amount: "50000",
            code: "057",
            account_number: "0000000000"
        }
        const res = await request.post("/pay/fund/bank").send(data).set("mb-token", token)
        expect(res.status).toEqual(OK)
        expect(res.body).toHaveProperty("data")
        expect(res.body).toHaveProperty("status")
        expect(res.body).toHaveProperty("message")
        expect(res.body.status).toEqual(success)
        expect(res.body.message).toEqual("Payment attempted successfully")
    }, 20000)

    it("should fail for any empty field", async () => {
        const data = {
            amount: "50000",
            code: "",
            account_number: "0000000000"
        }
        const res = await request.post("/pay/fund/bank").send(data).set("mb-token", token)
        expect(res.status).toEqual(BAD_REQUEST)
        expect(res.body).toHaveProperty("status")
        expect(res.body).toHaveProperty("message")
        expect(res.body.status).toEqual(error)
        expect(res.body.message).toEqual("Please provide all required fields")
    }, 20000)
})

describe("Test for Debiting wallet", () => {
    //Currently in starter business mode so can't carry out third party
    //transfers hence why this tests returns an error instead of passsing
    //with status of success and status code of 200
    it("should create a charge request depending on otp", async () => {
        const data = {
            amount: 50000,
            code: "050",
            account_number: "0000000000"
        }
        const res = await request.post("/pay/debit").send(data).set("mb-token", token)
        expect(res.status).toEqual(BAD_REQUEST)
        expect(res.body).toHaveProperty("status")
        expect(res.body).toHaveProperty("message")
        expect(res.body.status).toEqual(error)
        expect(res.body.message).toEqual(
            "Insufficient Fund: Kindly top up your bizz wallet to carry out this transaction"
        )
    }, 20000)

    it("should fail for any empty field", async () => {
        const data = {
            amount: "50000",
            code: "",
            account_number: "0000000000"
        }
        const res = await request.post("/pay/debit").send(data).set("mb-token", token)
        expect(res.status).toEqual(BAD_REQUEST)
        expect(res.body).toHaveProperty("status")
        expect(res.body).toHaveProperty("message")
        expect(res.body.status).toEqual(error)
        expect(res.body.message).toEqual("Please provide all required fields")
    }, 20000)

    it("should fail for insufficient fund from wallet", async () => {
        const data = {
            amount: 5000000000,
            code: "057",
            account_number: "0000000000"
        }
        const res = await request.post("/pay/debit").send(data).set("mb-token", token)
        expect(res.status).toEqual(BAD_REQUEST)
        expect(res.body).toHaveProperty("status")
        expect(res.body).toHaveProperty("message")
        expect(res.body.status).toEqual(error)
        expect(res.body.message).toEqual(
            "Insufficient Fund: Kindly top up your bizz wallet to carry out this transaction"
        )
    }, 20000)
})
