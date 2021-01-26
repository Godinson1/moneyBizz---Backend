process.env.NODE_ENV = "test"
import supertest from "supertest"
import { app } from "../../app"
import { connectToTestDB } from "../../Utility"

const request = supertest(app)
jest.useFakeTimers()

beforeAll(async () => {
    connectToTestDB()
}, 10000)

describe("Test fot Authentication endpoints", () => {
    it("should return all users in database", async () => {
        const data = await request.get("/user")
        expect(data.status).toEqual(200)
    })
})
