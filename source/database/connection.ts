import mongoose from "mongoose"

mongoose
    .connect(`${process.env.MONGO_URL}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then()
    .catch((err) =>
        console.log(
            err.code === "ETIMEOUT" ? "Hi Money bizzer! Please check your internet connection and try again." : ""
        )
    )

const connection = mongoose.connection

export { connection }
