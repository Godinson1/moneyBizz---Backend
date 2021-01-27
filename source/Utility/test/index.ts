import mongoose from "mongoose"
import { userData } from "./constant"

const connectToTestDB = (): void => {
    mongoose.connect(`${process.env.MONGO_DB_URI}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
}

export { connectToTestDB, userData }
