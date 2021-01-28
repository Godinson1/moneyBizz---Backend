import mongoose from "mongoose"
import { userData, regData } from "./constant"

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

export { connectToTestDB, userData, regData, closeDBConnection }
