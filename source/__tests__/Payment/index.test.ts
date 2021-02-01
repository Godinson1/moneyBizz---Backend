process.env.NODE_ENV = "test"
import supertest from "supertest"
import { app } from "../../app"
import { connectToTestDB, closeDBConnection } from "../../Utility"

const request = supertest(app)
jest.useFakeTimers()

beforeAll(async () => {
    connectToTestDB()
}, 10000)

afterAll(() => {
    closeDBConnection()
})

describe("Test for Funding wallet", () => {
    it("should create a charge request depending on otp", async () => {
        const data = await request.post("/pay/fund")
        expect(data.status).toEqual(200)
    }, 10000)
})
