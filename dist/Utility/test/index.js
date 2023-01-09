"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signInTestUser = exports.closeDBConnection = exports.regData = exports.userData = exports.connectToTestDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const constant_1 = require("./constant");
Object.defineProperty(exports, "userData", { enumerable: true, get: function () { return constant_1.userData; } });
Object.defineProperty(exports, "regData", { enumerable: true, get: function () { return constant_1.regData; } });
const connectToTestDB = () => {
    mongoose_1.default.connect(`${process.env.MONGO_DB_URI}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    });
};
exports.connectToTestDB = connectToTestDB;
const closeDBConnection = () => {
    mongoose_1.default.connection.close();
};
exports.closeDBConnection = closeDBConnection;
const signInTestUser = (request) => __awaiter(void 0, void 0, void 0, function* () {
    const credentials = { data: "godinson", password: "123456" };
    const data = yield request.post("/auth/login").send(credentials);
    const token = data.body.token;
    return token;
});
exports.signInTestUser = signInTestUser;
