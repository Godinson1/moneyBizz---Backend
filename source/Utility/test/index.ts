import mongoose from "mongoose"

const connectToTestDB = (): void => {
    mongoose.connect(`${process.env.MONGO_URL}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
}

export { connectToTestDB }
