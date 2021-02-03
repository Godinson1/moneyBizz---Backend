process.env.NODE_ENV = "test"
import supertest from "supertest"
import { app } from "../../app"
import { connectToTestDB, closeDBConnection, userData } from "../../Utility"

const request = supertest(app)
let token: string

beforeAll(async () => {
    connectToTestDB()
    const credentials = { data: "godinson", password: "123456" }
    const data = await request.post("/auth/login").send(credentials)
    token = data.body.token
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
        const res = await request.post("/pay/fund").send(data).set("mb-token", token)
        expect(res.status).toEqual(200)
    }, 20000)
})
