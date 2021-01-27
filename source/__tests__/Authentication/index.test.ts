process.env.NODE_ENV = "test"
import supertest from "supertest"
import { app } from "../../app"
import { connectToTestDB, error, userData, success } from "../../Utility"
import { StatusCodes } from "http-status-codes"
import { User } from "../../models"

const request = supertest(app)
const { BAD_REQUEST, CREATED } = StatusCodes

jest.useFakeTimers()

beforeAll(async () => {
    connectToTestDB()
    await request.post("/auth/register").send(userData)
}, 10000)

afterAll(async () => {
    await User.deleteMany({})
})

describe("Test fot Authentication endpoints", () => {
    it("should fail for any empty field", async () => {
        const data = { data: "", password: "test123" }
        const result = await request.post("/auth/login").send(data)
        expect(result.status).toEqual(BAD_REQUEST)
        expect(result.body.status).toEqual(error)
    })

    it("should fail for empty fields", async () => {
        const data = { data: "", password: "" }
        const result = await request.post("/auth/login").send(data)
        expect(result.status).toEqual(BAD_REQUEST)
        expect(result.body.status).toEqual(error)
    })

    it("should fail for wrong credentials", async () => {
        const data = { data: "fake@gmail.com", password: "wrongpassword" }
        const result = await request.post("/auth/login").send(data)
        expect(result.status).toEqual(BAD_REQUEST)
        expect(result.body.status).toEqual(error)
    }, 10000)

    it("should login successfully", async () => {
        const data = { data: "godinson45@gmail.com", password: "123456" }
        const result = await request.post("/auth/login").send(data)
        expect(result.status).toEqual(CREATED)
        expect(result.body.status).toEqual(success)
        expect(result.body).toHaveProperty("message")
        expect(result.body).toHaveProperty("token")
    }, 10000)
})
