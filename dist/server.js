"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const connection_1 = require("./database/connection");
// setting server post
const PORT = process.env.PORT || 5000;
// creatinng the server
const server = http_1.default.createServer(app_1.app);
connection_1.connection.on("open", () => console.log("Connection to MongoDB Atlas established successfully"));
server.listen(PORT, () => console.log(`Server running at PORT: ${PORT}`));
