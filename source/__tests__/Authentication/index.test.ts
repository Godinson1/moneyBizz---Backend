process.env.NODE_ENV = "test"
import supertest from "supertest"
import { app } from "../../app"
import { connectToTestDB, error } from "../../Utility"
import { StatusCodes } from "http-status-codes"

const request = supertest(app)
const { BAD_REQUEST } = StatusCodes

jest.useFakeTimers()
beforeAll(() => {
    connectToTestDB()
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
        expect(result.status).toEqual(BAD_REQUEST)
        expect(result.body.status).toEqual(error)
        expect(result.body).toHaveProperty("message")
    }, 10000)
})
