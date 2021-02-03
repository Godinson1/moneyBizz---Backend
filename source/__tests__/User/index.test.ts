process.env.NODE_ENV = "test"
import supertest from "supertest"
import { app } from "../../app"
import { StatusCodes } from "http-status-codes"
import { connectToTestDB, closeDBConnection } from "../../Utility"

const { OK, INTERNAL_SERVER_ERROR } = StatusCodes
const request = supertest(app)

beforeAll(() => {
    connectToTestDB()
}, 10000)

afterAll(() => {
    closeDBConnection()
})

jest.useFakeTimers()

describe("Test for Authentication endpoints", () => {
    it("should return all users in database", async () => {
        try {
            const data = await request.get("/user")
            expect(data.status).toEqual(OK)
        } catch (err) {
            console.log(err)
            expect(err.status).toEqual(INTERNAL_SERVER_ERROR)
        }
    }, 10000)

    it("should return all users in database", async () => {
        try {
            const data = await request.delete("/user")
            expect(data.status).toEqual(OK)
        } catch (err) {
            console.log(err)
            expect(err.status).toEqual(INTERNAL_SERVER_ERROR)
        }
    }, 10000)
})
