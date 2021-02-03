process.env.NODE_ENV = "test"
import supertest from "supertest"
import { app } from "../../app"
import { connectToTestDB, closeDBConnection, regData, error, success } from "../../Utility"
import { StatusCodes } from "http-status-codes"
import { User } from "../../models"

const request = supertest(app)
const { BAD_REQUEST, CREATED, OK, INTERNAL_SERVER_ERROR } = StatusCodes

beforeAll(async () => {
    connectToTestDB()
}, 10000)

afterAll(async () => {
    //await User.findOneAndDelete({ email: regData.email })
    closeDBConnection()
})

jest.useFakeTimers()

describe("Test for Authentication endpoints - Register", () => {
    it("should fail for any empty field", async () => {
        const data = { email: "", handle: "", firstName: "", lastName: "", password: "test123" }
        const result = await request.post("/auth/register").send(data)
        expect(result.status).toEqual(BAD_REQUEST)
        expect(result.body.status).toEqual(error)
    })

    it("should fail for existing email", async () => {
        const data = {
            email: "godinson100@gmail.com",
            handle: "hello",
            firstName: "Testing",
            lastName: "Testing",
            password: "test123"
        }
        const result = await request.post("/auth/register").send(data)
        expect(result.status).toEqual(BAD_REQUEST)
        expect(result.body.status).toEqual(error)
        expect(result.body).toHaveProperty("message")
        expect(result.body.message).toEqual(`User with email/handle already exist`)
    }, 10000)

    it("should fail for existing handle", async () => {
        const data = {
            email: "testing@gmail.com",
            handle: "godinson",
            firstName: "Testing",
            lastName: "Testing",
            password: "test123"
        }
        const result = await request.post("/auth/register").send(data)
        expect(result.status).toEqual(BAD_REQUEST)
        expect(result.body.status).toEqual(error)
        expect(result.body).toHaveProperty("message")
        expect(result.body.message).toEqual("User with email/handle already exist")
    }, 10000)

    it("should fail for missing fields", async () => {
        const data = { firstName: "", lastName: "", password: "test123" }
        const result = await request.post("/auth/register").send(data)
        expect(result.status).toEqual(INTERNAL_SERVER_ERROR)
        expect(result.body.status).toEqual(error)
    }, 10000)

    it("should register user successfully", async () => {
        const result = await request.post("/auth/register").send(regData)
        expect(result.status).toEqual(CREATED)
        expect(result.body.status).toEqual(success)
        expect(result.body).toHaveProperty("message")
        expect(result.body.message).toEqual("Successfully registered")
        expect(result.body).toHaveProperty("token")
    }, 10000)
})

describe("Test for Authentication endpoints - Login", () => {
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
        const data = { data: "godinson100@gmail.com", password: "123456" }
        const result = await request.post("/auth/login").send(data)
        expect(result.status).toEqual(OK)
        expect(result.body.status).toEqual(success)
        expect(result.body).toHaveProperty("message")
        expect(result.body).toHaveProperty("token")
    }, 10000)
})
