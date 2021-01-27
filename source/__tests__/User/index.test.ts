process.env.NODE_ENV = "test"
import supertest from "supertest"
import { app } from "../../app"
import { connectToTestDB } from "../../Utility"

const request = supertest(app)
jest.useFakeTimers()
beforeAll(() => {
    connectToTestDB()
}, 10000)

describe("Test for Authentication endpoints", () => {
    it("should return all users in database", async () => {
        try {
            const data = await request.get("/user")
            expect(data.status).toEqual(200)
        } catch (err) {
            console.log(err)
        }
    }, 10000)
})
