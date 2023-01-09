"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default
    .connect(`${process.env.MONGO_URL}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
    .then()
    .catch((err) => console.log(err.code === "ETIMEOUT" ? "Hi Money bizzer! Please check your internet connection and try again." : ""));
const connection = mongoose_1.default.connection;
exports.connection = connection;
