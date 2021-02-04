import mongoose from "mongoose"
import { userData, regData } from "./constant"
import supertest from "supertest"

const connectToTestDB = (): void => {
    mongoose.connect(`${process.env.MONGO_DB_URI}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
}

const closeDBConnection = (): void => {
    mongoose.connection.close()
}

const signInTestUser = async (request: supertest.SuperTest<supertest.Test>): Promise<string> => {
    const credentials = { data: "godinson", password: "123456" }
    const data = await request.post("/auth/login").send(credentials)
    const token = data.body.token
    return token
}

export { connectToTestDB, userData, regData, closeDBConnection, signInTestUser }
