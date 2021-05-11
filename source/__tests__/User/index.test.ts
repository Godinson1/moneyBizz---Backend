process.env.NODE_ENV = "test"
import supertest from "supertest"
import { app } from "../../app"
import { StatusCodes } from "http-status-codes"
import { connectToTestDB, closeDBConnection, signInTestUser, success } from "../../Utility"

const { OK } = StatusCodes
const request = supertest(app)
let token: string

beforeAll(async () => {
    connectToTestDB()
    token = await signInTestUser(request)
}, 10000)

afterAll(() => {
    closeDBConnection()
})

jest.useFakeTimers()

describe("Test for Authentication endpoints", () => {
    it("should return all users in database", async () => {
        const data = await request.get("/user")
        expect(data.status).toEqual(OK)
        expect(data.body).toHaveProperty("status")
        expect(data.body).toHaveProperty("message")
        expect(data.body).toHaveProperty("data")
        expect(data.body.message).toEqual("Users data retrieved successfully")
        expect(data.body.status).toEqual(success)
    }, 10000)

    it("should retrieve single user details in database", async () => {
        const data = await request.get("/user/details").set("mb-token", token)
        expect(data.status).toEqual(OK)
        expect(data.body).toHaveProperty("status")
        expect(data.body).toHaveProperty("message")
        expect(data.body).toHaveProperty("data")
        expect(data.body.message).toEqual("User data retrieved successfully")
        expect(data.body.status).toEqual(success)
    }, 10000)
})
