process.env.NODE_ENV = "test"
import supertest from "supertest"
import { app } from "../../app"
import { StatusCodes } from "http-status-codes"
import { connectToTestDB, closeDBConnection, signInTestUser, success, error } from "../../Utility"

const { OK, NOT_FOUND } = StatusCodes
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

    it("should fail retrieving single user with handle that does not exist", async () => {
        const data = await request.get("/user/fakehandle").set("mb-token", token)
        expect(data.status).toEqual(NOT_FOUND)
        expect(data.body).toHaveProperty("status")
        expect(data.body).toHaveProperty("message")
        expect(data.body.message).toEqual("User with @fakehandle does not exist")
        expect(data.body.status).toEqual(error)
    }, 10000)

    it("should retrieve single user in database", async () => {
        const data = await request.get("/user/godinson").set("mb-token", token)
        expect(data.status).toEqual(OK)
        expect(data.body).toHaveProperty("status")
        expect(data.body).toHaveProperty("message")
        expect(data.body).toHaveProperty("data")
        expect(data.body.message).toEqual("User data retrieved successfully")
        expect(data.body.status).toEqual(success)
    }, 10000)
})
