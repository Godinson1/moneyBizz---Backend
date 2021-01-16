import http from "http"
import { app } from "./app"
import { connection } from "./source/database/connection"

// setting server post
const PORT = process.env.PORT || 5000

// creatinng the server
const server = http.createServer(app)

connection.on("open", () => console.log("Connection to MongoDB Atlas established successfully"))

server.listen(PORT, () => console.log(`Server running at PORT: ${PORT}`))
