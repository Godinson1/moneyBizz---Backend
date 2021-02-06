import mongoose from "mongoose"

mongoose.connect(`${process.env.MONGO_DB_URI}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})

const connection = mongoose.connection

export { connection }
